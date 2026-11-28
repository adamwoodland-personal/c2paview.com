// Service worker for c2paview.com (fleet pattern: network-first code, cache-first big assets).
//
//  - The WASM validator and SDK (@contentauth/c2pa-web) are precached, so the whole tool works offline.
//    The SDK's JS sits in CACHE; the 8.7 MB WASM sits in ASSETS, which a deploy keeps (see below).
//  - Bump CACHE on deploys that change any precached file, the WASM included.
//  - Also receives Android share-sheet files (share_target POST /share): the shared file is
//    parked under a one-time id and the client picks it up after redirect (see INBOX below).
//  - The shell is '/', never '/index.html': that URL 301s to '/' (the canonical-host function), so
//    a precached copy would be a redirected response, which browsers refuse for a navigation (an
//    offline /?shared=<id> handoff would fail).
const CACHE = 'cv-v18';
const CORE = [
	'/',
	'/styles.css',
	'/app.js',
	'/lib/c2pa-web.js',
	'/lib/c2pa-web-core.js',
	'/lib/highgain.js',
	'/lib/c2pa-utilities/assetSize.js',
	'/lib/c2pa-utilities/caseConversion.js',
	'/lib/c2pa-utilities/context.js',
	'/lib/c2pa-utilities/fetchWithRetry.js',
	'/lib/c2pa-utilities/index.js',
	'/lib/c2pa-utilities/settings.js',
	'/lib/c2pa-utilities/signingAlg.js',
	'/lib/ts-deepmerge.js',
	'/favicon.svg',
	'/manifest.json',
	'/samples/signed.jpg',
	'/trust/c2pa-trust-list.pem',
	'/trust/c2pa-tsa-trust-list.pem',
	'/trust/interim-anchors.pem',
	'/trust/interim-allowed.sha256.txt',
	'/trust/store.cfg'
];

// ---- The big files, kept across deploys (2026-11-28; the fleet block, as in lookupanddown.com,
// whatsacross.com, orrery.live and talkinghurts.com) ----------------------------------------------
// They used to sit in CACHE, so every deploy threw them away and a returning visitor downloaded them
// again. They now live in ASSETS, which a deploy keeps. Each update (install) asks the server whether
// each kept file has changed, with a HEAD request (headers only, no body), and compares ETags
// (CloudFront marks a compressed copy's ETag weak, W/"…", so the W/ is ignored). An unchanged file is
// kept; a changed one is fetched again (a precached one at once, any other when next needed). So a
// file changed in place needs only the usual CACHE bump, which is what makes the update run. The new
// copies go into STAGE and are swapped in on activate, never while the old worker may still be
// serving from ASSETS.
// Here: the SDK's WASM, which must match the SDK's JS in CORE (an SDK upgrade changes both in place,
// as 0.17.2 did on 2026-11-25). The upgrade bumps CACHE; install then sees the new WASM's ETag and
// fetches it, and activate swaps it in at the same moment as the new JS.
const ASSETS = 'cv-assets';
const STAGE = 'cv-assets-next';
const ASSET_CORE = ['/lib/c2pa_bg.wasm'];
const isAsset = (url) => /^\/lib\/c2pa_bg\.wasm$/.test(new URL(url, location.href).pathname);
const etagOf = (res) => ((res && res.headers.get('ETag')) || '').replace(/^W\//, '');
const GONE = 'X-Asset-Gone';   // a STAGE entry carrying this header means "delete it from ASSETS"

async function stageAssets() {
	await caches.delete(STAGE);   // what a half-finished earlier install left
	const assets = await caches.open(ASSETS), stage = await caches.open(STAGE);
	// What this browser holds: ASSETS, then any big file an older worker kept in its own cache.
	const held = new Map();
	for (const r of await assets.keys()) held.set(new URL(r.url).pathname, { c: assets, r, kept: true });
	for (const k of await caches.keys()) {
		if (k === ASSETS || k === STAGE || k === CACHE) continue;
		const c = await caches.open(k);
		for (const r of await c.keys()) {
			const p = new URL(r.url).pathname;
			if (isAsset(r.url) && !held.has(p)) held.set(p, { c, r, kept: false });
		}
	}
	await Promise.all([...new Set([...held.keys(), ...ASSET_CORE])].map(async (p) => {
		const h = held.get(p), copy = h && await h.c.match(h.r);
		let same = false;
		if (copy && etagOf(copy)) {
			try {
				const head = await fetch(p, { method: 'HEAD', cache: 'no-store' });
				same = head.ok && etagOf(head) === etagOf(copy);
			} catch (err) { same = true; }   // no answer: keep what is here
		}
		if (same) { if (!h.kept) await stage.put(p, copy); return; }   // an older cache's copy moves across
		// Changed, gone from the server, or never fetched. A precached file is fetched now (a failure fails
		// the install, as addAll always did); any other kept one is dropped, to be fetched when next needed.
		if (ASSET_CORE.includes(p)) await stage.add(new Request(p, { cache: 'no-cache' }));
		else if (h && h.kept) await stage.put(p, new Response(null, { headers: { [GONE]: '1' } }));
	}));
}

async function applyAssets() {
	if (!(await caches.has(STAGE))) return;
	const stage = await caches.open(STAGE), assets = await caches.open(ASSETS);
	for (const r of await stage.keys()) {
		const res = await stage.match(r);
		if (res.headers.get(GONE)) await assets.delete(r);
		else await assets.put(r, res);
	}
	await caches.delete(STAGE);
}

async function fromAssets(e, req) {
	const c = await caches.open(ASSETS);
	const hit = await c.match(req);
	if (hit) return hit;
	const res = await fetch(req);
	// waitUntil, so the worker isn't stopped before the write lands.
	if (res.ok) e.waitUntil(c.put(req, res.clone()).catch(() => { /* storage full: carry on */ }));
	return res;
}
// ---- end of the fleet block ----

// Shared files wait in INBOX under /inbox/<random id>, so overlapping shares can't swap files. The
// page deletes its file as soon as it reads it, and won't open one older than INBOX_TTL. Nothing
// runs on a timer: a file left by an interrupted handoff stays until the next sweep once it is past
// INBOX_TTL (on the next share, page load or service-worker update). A file over the SDK's own
// limit (10^9 bytes) could never be read, so it is not stored at all.
const INBOX = 'share-inbox';
const INBOX_TTL = 5 * 60 * 1000;
const INBOX_MAX = 10 ** 9;
async function sweepInbox() {
	if (!(await caches.has(INBOX))) return;
	const c = await caches.open(INBOX);
	for (const req of await c.keys()) {
		const res = await c.match(req);
		const age = Date.now() - Number(res && res.headers.get('X-Shared-At'));
		if (!(age >= 0 && age < INBOX_TTL)) await c.delete(req);
	}
}

self.addEventListener('install', (e) => {
	e.waitUntil(Promise.all([caches.open(CACHE).then((c) => c.addAll(CORE)), stageAssets()]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		applyAssets()
			.then(() => caches.keys())
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== ASSETS && k !== INBOX).map((k) => caches.delete(k))))
			.then(() => sweepInbox().catch(() => {}))   // only expired entries: an in-flight share is kept
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (e) => {
	const req = e.request;
	const url = new URL(req.url);
	if (url.origin !== location.origin) return;

	// Android share sheet: park the file under a fresh id, then land the client on /?shared=<id>.
	if (req.method === 'POST' && url.pathname === '/share') {
		e.respondWith((async () => {
			try {
				await sweepInbox();
				const file = (await req.formData()).get('file');
				if (!file || typeof file === 'string') return Response.redirect('/', 303);
				if (file.size > INBOX_MAX) return Response.redirect('/?shared=too-large', 303);
				const id = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
				const c = await caches.open(INBOX);
				await c.put(`/inbox/${id}`, new Response(file, {
					headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name || 'shared-file'), 'X-Shared-At': String(Date.now()) },
				}));
				return Response.redirect(`/?shared=${id}`, 303);
			} catch (err) {
				return Response.redirect('/?shared=failed', 303);   // e.g. storage full: the page says so
			}
		})());
		return;
	}

	if (req.method !== 'GET') return;

	// The WASM: cache-first from ASSETS.
	if (isAsset(req.url)) { e.respondWith(fromAssets(e, req)); return; }

	// The other big immutable assets: cache-first.
	if (url.pathname.startsWith('/lib/') || url.pathname.startsWith('/samples/')) {
		e.respondWith(
			caches.open(CACHE).then(async (c) => {
				const hit = await c.match(req);
				if (hit) return hit;
				const res = await fetch(req);
				if (res.ok) c.put(req, res.clone());
				return res;
			})
		);
		return;
	}

	// Everything else: network-first so a redeploy shows up at once. Query URLs (/?shared=<id>) are
	// not cached: each would be a new entry, and offline they fall back to the shell anyway.
	e.respondWith(
		fetch(req)
			.then((res) => {
				if (res.ok && !url.search) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
				return res;
			})
			.catch(async () => {
				const hit = await caches.match(req);
				if (hit) return hit;
				if (req.mode === 'navigate') { const shell = await caches.match('/'); if (shell) return shell; }
				return Response.error();
			})
	);
});
