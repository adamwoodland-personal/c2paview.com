// Service worker for c2paview.com (fleet pattern: network-first code, cache-first big assets).
//
//  - The WASM validator and SDK (@contentauth/c2pa-web) are precached, so the whole tool works offline.
//  - Bump CACHE on deploys that change any precached file.
//  - Also receives Android share-sheet files (share_target POST /share): the shared file is
//    parked under a one-time id and the client picks it up after redirect (see INBOX below).
//  - The shell is '/', never '/index.html': that URL 301s to '/' (the canonical-host function), so
//    a precached copy would be a redirected response, which browsers refuse for a navigation (an
//    offline /?shared=<id> handoff would fail).
const CACHE = 'cv-v16';
const CORE = [
	'/',
	'/styles.css',
	'/app.js',
	'/lib/c2pa-web.js',
	'/lib/c2pa-web-core.js',
	'/lib/highgain.js',
	'/lib/c2pa_bg.wasm',
	'/favicon.svg',
	'/manifest.json',
	'/samples/signed.jpg',
	'/trust/c2pa-trust-list.pem',
	'/trust/c2pa-tsa-trust-list.pem',
	'/trust/interim-anchors.pem',
	'/trust/interim-allowed.sha256.txt',
	'/trust/store.cfg'
];

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
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== INBOX).map((k) => caches.delete(k))))
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

	// The big immutable assets: cache-first.
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
