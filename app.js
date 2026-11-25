// Content Credentials Viewer - inspect and validate C2PA manifests entirely in the browser,
// using the official c2pa-web SDK (@contentauth/c2pa-web: the C2PA Rust library, c2pa-rs,
// compiled to WASM). Moved from the deprecated c2pa-js SDK on 2026-10-23.
import { createC2pa, Reader, Context } from './lib/c2pa-web.js';

const $ = (q) => document.querySelector(q);

// The SDK runs in a blob: worker (CSP worker-src blob:) and compiles the WASM on this page, so the
// service worker's precached copy serves it offline. The URL must be absolute.
const c2paReady = createC2pa({ wasmSrc: new URL('lib/c2pa_bg.wasm', location.href).href });

// Trust lists (self-hosted snapshots): the official C2PA Conformance Program anchors, its
// TSA anchors, and the interim CAI list most production assets still chain to. With these,
// a valid-but-unknown signer surfaces as signingCredential.untrusted instead of passing green.
let trustEnabled = false;
const trustReady = (async () => {
  try {
    const [a1, a2, a3, allowed, cfg] = await Promise.all([
      'trust/c2pa-trust-list.pem', 'trust/c2pa-tsa-trust-list.pem', 'trust/interim-anchors.pem',
      'trust/interim-allowed.sha256.txt', 'trust/store.cfg',
    ].map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.text(); })));
    trustEnabled = true;
    // Signer anchors and time-stamp authority anchors are separate lists (c2pa-rs 0.92 checks a
    // time stamp only against `tsaTrust`): the C2PA TSA list goes there, with the interim CAI
    // anchors in both, as they were before (they include time-stamp roots too).
    return {
      all: {
        trust: { trustAnchors: `${a1}\n${a3}`, allowedList: allowed, trustConfig: cfg },
        tsaTrust: { trustAnchors: `${a2}\n${a3}` },
        verify: { verifyTrust: true, remoteManifestFetch: false },
      },
      // The official C2PA lists alone (same certificate rules): a signer trusted with `all` but not
      // with this is on the frozen interim list only, which the result then says (see inspect()).
      official: {
        trust: { trustAnchors: a1, trustConfig: cfg },
        tsaTrust: { trustAnchors: a2 },
        verify: { verifyTrust: true, remoteManifestFetch: false },
      },
    };
  } catch (e) { return null; }   // offline before first cache: integrity-only
})();
// Settings are resolved once per Context. Remote manifests are never fetched (c2pa-rs would by
// default, following a URL inside the file): this viewer reads only what is embedded, and the
// privacy promise must not depend on the CSP blocking the request. Without the lists, trust
// checking is switched off explicitly, so an intact file reads amber: intact, signer not checked.
const contextReady = trustReady.then((s) => new Context(s ? s.all : { verify: { verifyTrust: false, remoteManifestFetch: false } }));
const officialContextReady = trustReady.then((s) => (s ? new Context(s.official) : null));

// The SDK wants the format; browsers leave file.type empty for some types (and always for .c2pa).
const EXT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif',
  heic: 'image/heic', heif: 'image/heif', gif: 'image/gif', tif: 'image/tiff', tiff: 'image/tiff',
  dng: 'image/x-adobe-dng', svg: 'image/svg+xml', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime',
  m4a: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', pdf: 'application/pdf', c2pa: 'application/c2pa',
};
// A .c2pa sidecar is always application/c2pa; otherwise trust the browser unless it gave nothing useful.
function formatOf(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'c2pa') return EXT_TYPES.c2pa;
  return (file.type && file.type !== 'application/octet-stream' ? file.type : EXT_TYPES[ext]) || '';
}

// Plain-English versions of the SDK's read errors.
function readError(e) {
  const msg = (e && (e.message || e.name)) || String(e);
  if (/AssetTooLarge/i.test(msg) || (e && e.name === 'AssetTooLargeError')) return 'it is larger than 1 GB, the most this viewer can read.';
  if (/Prerelease/i.test(msg)) return 'it carries credentials from a pre-release draft of the C2PA standard, which can no longer be validated.';
  if (/UnsupportedType|unsupported/i.test(msg)) return 'this file type is not supported.';
  return msg;
}

// ------------------------------------------------------------------ helpers
function elc(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
const fmtBytes = (n) => n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
};

// Where in the manifest a failure sits, from the jumbf path in the status url.
const WHERE_HINTS = {
  'c2pa.hash.data': 'the hash covering the actual image/audio content',
  'c2pa.hash.boxes': 'the hash covering the file structure',
  'c2pa.hash.bmff': 'the hash covering the video container',
  'c2pa.thumbnail.claim.jpeg': 'the embedded claim thumbnail',
  'c2pa.thumbnail.claim.png': 'the embedded claim thumbnail',
  'c2pa.thumbnail.ingredient.jpeg': "an ingredient's thumbnail",
  'c2pa.actions': 'the recorded edit history',
  'c2pa.ingredient': 'an ingredient reference',
};
function whereOf(url) {
  const m = /\/c2pa\.assertions\/([^/]+)/.exec(url || '');
  if (!m) return null;
  const name = m[1].replace(/__\d+$/, '');
  return WHERE_HINTS[name] || `the "${name}" assertion`;
}

// A friendly line for the machine-readable validation codes.
const CODE_HINTS = {
  'assertion.dataHash.mismatch': 'the pixels/bytes have been changed since signing',
  'assertion.hashedURI.mismatch': 'an assertion was altered after signing',
  'claimSignature.mismatch': 'the claim signature does not match',
  'signingCredential.untrusted': 'the signing certificate is not on the known-certificates list',
  'signingCredential.expired': 'the signing certificate had expired',
  'signingCredential.revoked': 'the signing certificate was revoked',
  'signingCredential.ocsp.revoked': 'the signing certificate was revoked by its issuer',   // the spec's name for it
  'claimSignature.outsideValidity': 'the record was signed outside the signing certificate’s validity period',
  'assertion.bmffHash.mismatch': 'the video/audio/image data has been changed since signing',
  'timeStamp.mismatch': 'the trusted timestamp does not match',
  'general.error': 'the manifest could not be read',
};
// The row id for a code on /c2pa-validation-codes/ (assertion.dataHash.mismatch -> assertion-datahash-mismatch).
const codeAnchor = (code) => String(code).toLowerCase().replace(/[^a-z0-9]+/g, '-');
// What kind of check failed, so a red result says which: only a content hash mismatch means the file
// itself changed; a bad signature or manifest, or a signer problem, says nothing about edits.
function failureKinds(list) {
  const kinds = new Set(list.map((s) => (/^assertion\.[a-zA-Z]*Hash\.mismatch$/.test(s.code) ? 'content'
    : s.code === 'signingCredential.untrusted' ? 'untrusted'
    : /^(signingCredential|timeStamp)\./.test(s.code) ? 'signer' : 'credentials')));
  return [
    kinds.has('content') && 'the file was changed (or damaged) after signing',
    kinds.has('credentials') && 'the credentials themselves (signature or manifest) don’t check out, so they can’t be relied on',
    kinds.has('signer') && 'the signer’s certificate or timestamp failed its checks',
    kinds.has('untrusted') && 'the signer is not on the C2PA trust lists',
  ].filter(Boolean).join('; ');
}

// The schema.org author marked as a Person, as the old SDK's selectProducer() did.
function producerOf(manifest) {
  const cw = (manifest.assertions || []).find((a) => /^stds\.schema-org\.CreativeWork/.test(a.label));
  const authors = (cw && cw.data && cw.data.author) || [];
  const list = Array.isArray(authors) ? authors : [authors];
  const p = list.find((a) => a && a['@type'] === 'Person') || list.find((a) => a && a.name);
  return p ? p.name : null;
}
// Version 1 claims carry a claim_generator string; version 2 claims only claim_generator_info.
function generatorOf(manifest) {
  if (manifest.claim_generator) return manifest.claim_generator.split('(')[0].trim().replace(/[_/]/g, ' ');
  const info = (manifest.claim_generator_info || []).filter((g) => g && g.name && !/^c2pa-rs$/i.test(g.name));
  return info.map((g) => [g.name, g.version].filter(Boolean).join(' ')).join(', ') || null;
}
// The raw JSON view shows `hash` and `pad` byte arrays as hex (the view's label says so) instead of
// hundreds of lines of numbers. Only those keys: other numeric arrays are shown exactly as stored.
const rawReplacer = (k, v) => (/^(hash|pad\d?)$/.test(k) && Array.isArray(v) && v.every((n) => Number.isInteger(n) && n >= 0 && n < 256)
  ? v.map((n) => n.toString(16).padStart(2, '0')).join('') : v);

// Validation results, from validation_results (the complete, current form) where the SDK provides it:
// the active manifest's entries plus each ingredient's deltas. validation_status is the older
// summary of the same failures, used only if validation_results is missing.
function resultsOf(store) {
  const vr = store.validation_results;
  if (!vr) return { failure: store.validation_status || [], success: [], fromResults: false };
  const failure = [...((vr.activeManifest && vr.activeManifest.failure) || [])];
  const success = [...((vr.activeManifest && vr.activeManifest.success) || [])];
  for (const d of vr.ingredientDeltas || []) {
    failure.push(...((d.validationDeltas && d.validationDeltas.failure) || []));
    success.push(...((d.validationDeltas && d.validationDeltas.success) || []));
  }
  return { failure, success, fromResults: true };
}
const ingredientFailures = (ing) => (ing.validation_results
  ? (ing.validation_results.activeManifest && ing.validation_results.activeManifest.failure) || []
  : ing.validation_status || []);

// What a CAWG identity assertion vouches for, from the assertions it references.
const VOUCHES = {
  'c2pa.hash.data': "the file's content", 'c2pa.hash.bmff': "the file's content", 'c2pa.hash.boxes': "the file's content",
  'c2pa.actions': 'the edit history', 'cawg.training-mining': 'the AI training and data-mining preferences',
  'c2pa.training-mining': 'the AI training and data-mining preferences', 'stds.schema-org.CreativeWork': 'the creator details',
  'cawg.metadata': 'the creator details', 'c2pa.metadata': 'the capture details',
};
function vouchesFor(payload) {
  const out = new Set();
  for (const r of (payload && payload.referenced_assertions) || []) {
    const m = /c2pa\.assertions\/([^/]+)$/.exec(r.url || '');
    if (!m) continue;
    const base = m[1].replace(/__\d+$/, '').replace(/\.v\d+$/, '');
    out.add(VOUCHES[base] || `the "${base}" assertion`);
  }
  return [...out];
}
// Any list of verified identities inside an identity-claims-aggregation assertion.
function verifiedIdentities(data) {
  const found = [];
  const walk = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 6) return;
    if (Array.isArray(o.verifiedIdentities || o.verified_identities)) found.push(...(o.verifiedIdentities || o.verified_identities));
    for (const v of Object.values(o)) walk(v, depth + 1);
  };
  walk(data, 0);
  // Each CAWG identity type names its subject in a different field (a wallet only has an address).
  const KIND = { 'cawg.social_media': 'social media account', 'cawg.crypto_wallet': 'crypto wallet',
    'cawg.document_verification': 'ID document', 'cawg.web_site': 'website', 'cawg.affiliation': 'affiliation' };
  return found.map((v) => {
    const who = v.name || v.username || v.address || v.uri || '';
    const kind = KIND[v.type] || '';
    const by = (v.provider && (v.provider.name || v.provider.id)) || '';
    return [who + (kind ? ` (${kind})` : ''), by && `verified by ${by}`].filter(Boolean).join(', ');
  }).filter(Boolean);
}

function kvRow(dl, k, v) {
  if (v === null || v === undefined || v === '') return;
  dl.appendChild(elc('dt', '', k));
  const dd = elc('dd');
  if (v instanceof Node) dd.appendChild(v); else dd.textContent = String(v);
  dl.appendChild(dd);
}

// ------------------------------------------------------------------ rendering
// ctx: { store, reader, urls, seen } - the whole manifest store (ingredients point into it by label),
// the Reader (for thumbnails), object URLs to revoke later, and labels already drawn.
function renderManifest(manifest, heading, ctx) {
  ctx.seen.add(manifest.label);
  const card = elc('section', 'card');
  card.appendChild(elc('h2', '', heading));
  const dl = elc('dl', 'kv');

  kvRow(dl, 'Title', manifest.title);
  kvRow(dl, 'Format', manifest.format);
  kvRow(dl, 'Produced by', producerOf(manifest));
  kvRow(dl, 'Claim generator', generatorOf(manifest));
  const sig = manifest.signature_info || {};
  kvRow(dl, 'Signed by', sig.issuer);
  if (sig.common_name && sig.common_name !== sig.issuer) kvRow(dl, 'Signing certificate', sig.common_name);
  kvRow(dl, 'Signed on', fmtDate(sig.time));
  kvRow(dl, 'Certificate serial', sig.cert_serial_number);
  kvRow(dl, 'C2PA version', manifest.claim_version ? `claim version ${manifest.claim_version}` : null);
  card.appendChild(dl);

  // Identity assertions (CAWG): a named person or organisation vouching for parts of the manifest.
  for (const a of (manifest.assertions || []).filter((x) => /^cawg\.identity/.test(x.label))) {
    const d = a.data || {};
    const payload = d.signer_payload || {};
    const box = elc('div', 'identity');
    box.appendChild(elc('h2', '', 'Who vouches for it'));
    const idl = elc('dl', 'kv');
    if (payload.sig_type === 'cawg.x509.cose') {
      const s = d.signature_info || {};
      kvRow(idl, 'Identity', s.common_name || s.issuer);
      if (s.issuer && s.issuer !== s.common_name) kvRow(idl, 'Certificate issued by', s.issuer);
      kvRow(idl, 'Proven by', 'an X.509 identity certificate');
    } else {
      const ids = verifiedIdentities(d);
      kvRow(idl, 'Identity', ids.length ? ids.join('; ') : null);
      kvRow(idl, 'Proven by', payload.sig_type === 'cawg.identity_claims_aggregation' ? 'an identity provider that verified the accounts listed' : payload.sig_type);
    }
    const covers = vouchesFor(payload);
    kvRow(idl, 'Vouches for', covers.length ? covers.join(', ') : null);
    box.appendChild(idl);
    // Its own result, kept out of the main verdict, and failing closed. Confirming who an identity
    // names needs a CAWG trust source, and none is configured (c2pa-rs doesn't yet enforce the full
    // CAWG X.509 trust model either), so there is no green outcome. The best is "intact, unconfirmed",
    // and only when the SDK explicitly reports this assertion as well-formed with a validated
    // signature. Anything less, including no result at all, reads as not checked.
    const at = (s) => /^cawg\./.test(s.code) && (s.url || '').includes(`/${manifest.label}/`)
      && (s.url || '').includes(`/c2pa.assertions/${a.label}`);
    const hard = ctx.results.failure.filter(at).filter((s) => !/\.untrusted$/.test(s.code));
    const oks = new Set(ctx.results.success.filter(at).map((s) => s.code));
    const sigOk = oks.has('cawg.identity.well-formed') && [...oks].some((c) => /^cawg\.[a-z0-9_]+\.signature\.validated$/.test(c));
    let note;
    if (hard.length) {
      note = elc('p', 'id-status bad', 'The identity claim failed validation: ');
      note.appendChild(elc('code', '', [...new Set(hard.map((s) => s.code))].join(', ')));
    } else if (sigOk) {
      note = elc('p', 'id-status warn', 'The identity claim is intact and its signature checks out, but no trust list for identity credentials is set up here, so who it names can’t be confirmed.');
    } else {
      note = elc('p', 'id-status warn', 'This identity claim could not be checked, so who it names is unconfirmed.');
    }
    box.appendChild(note);
    card.appendChild(box);
  }

  // Actions assertion, grouped into the consumer categories the C2PA UX guidance suggests.
  const ACTION_LABELS = {
    'c2pa.created': 'Created', 'c2pa.opened': 'Opened', 'c2pa.saved': 'Saved',
    'c2pa.color_adjustments': 'Colour adjustments (brightness, tone, filters)',
    'c2pa.filtered': 'Colour adjustments (brightness, tone, filters)',
    'c2pa.cropped': 'Cropped', 'c2pa.resized': 'Resized', 'c2pa.orientation': 'Rotated or flipped',
    'c2pa.edited': 'Edited', 'c2pa.drawing': 'Drawing or painting',
    'c2pa.placed': 'Compositing (merging, layering)', 'c2pa.removed': 'Content removed',
    'c2pa.transcoded': 'Format conversion', 'c2pa.converted': 'Format conversion',
    'c2pa.published': 'Published', 'c2pa.repackaged': 'Repackaged', 'c2pa.redacted': 'Information redacted',
  };
  const actions = (manifest.assertions || []).filter((a) => /^c2pa\.actions(\.v\d+)?(__\d+)?$/.test(a.label));
  const seen = new Map();
  for (const a of actions) {
    for (const act of (a.data && a.data.actions) || []) {
      let label = ACTION_LABELS[act.action] || (act.action || '').replace(/^c2pa\./, '').replace(/[_.]/g, ' ');
      if (act.softwareAgent) label += ` - ${typeof act.softwareAgent === 'string' ? act.softwareAgent : act.softwareAgent.name}`;
      if (act.digitalSourceType && /trainedAlgorithmicMedia/.test(act.digitalSourceType)) label += ' · fully AI-generated';
      else if (act.digitalSourceType && /compositeWithTrainedAlgorithmicMedia/.test(act.digitalSourceType)) label += ' · partly AI-generated';
      seen.set(label, (seen.get(label) || 0) + 1);
    }
  }
  const actList = [...seen.entries()].map(([label, n]) => n > 1 ? `${label} (×${n})` : label);
  if (actList.length) {
    card.appendChild(elc('h2', '', 'What was done'));
    const ul = elc('ul', 'actions');
    for (const a of actList) ul.appendChild(elc('li', '', a));
    card.appendChild(ul);
  }

  // Other assertions, tagged by origin: system-recorded vs entered by the creator
  // ("created" vs "gathered" in C2PA terms).
  const GATHERED = {
    'stds.schema-org.CreativeWork': 'Creator and attribution details',
    'stds.schema-org.CreativeWork__1': 'Creator and attribution details',
    'c2pa.training-mining': 'AI training and data-mining preferences',
    'cawg.training-mining': 'AI training and data-mining preferences',
    'cawg.metadata': 'Creator and attribution details',
  };
  const SYSTEM = {
    'stds.exif': 'Camera details (EXIF)',
    'c2pa.depthmap.GDepth': 'Depth map',
  };
  const APP = { 'c2pa.metadata': 'Capture and file details (time, device, software)' };
  const SKIP = /^(c2pa\.(actions|hash\.|thumbnail|ingredient|claim)|cawg\.identity)/;
  const others = [];
  for (const a of manifest.assertions || []) {
    if (!a.label || SKIP.test(a.label)) continue;
    const base = a.label.replace(/__\d+$/, '');
    if (GATHERED[base]) others.push(`${GATHERED[base]} - entered by the creator`);
    else if (SYSTEM[base]) others.push(`${SYSTEM[base]} - recorded by the capture device`);
    else if (APP[base]) others.push(`${APP[base]} - recorded by the signing app`);
    else others.push(`${a.label} - recorded by the signing app`);
  }
  if (others.length) {
    card.appendChild(elc('h2', '', 'Also recorded'));
    const ul = elc('ul', 'actions');
    for (const o of [...new Set(others)]) ul.appendChild(elc('li', '', o));
    card.appendChild(ul);
  }

  // Ingredients: what it was made from.
  if (manifest.ingredients && manifest.ingredients.length) {
    card.appendChild(elc('h2', '', `Made from ${manifest.ingredients.length} ingredient${manifest.ingredients.length > 1 ? 's' : ''}`));
    const ul = elc('ul', 'ings');
    for (const ing of manifest.ingredients) {
      const li = elc('li');
      if (ing.thumbnail && ing.thumbnail.identifier && ctx.reader) {
        const im = elc('img', 'ing-thumb');
        im.alt = ''; im.hidden = true;
        li.appendChild(im);
        ctx.reader.resourceToBytes(ing.thumbnail.identifier).then((bytes) => {
          const url = URL.createObjectURL(new Blob([bytes], { type: ing.thumbnail.format || 'image/jpeg' }));
          ctx.urls.push(url);
          im.src = url; im.hidden = false;
        }).catch(() => {});
      }
      li.appendChild(document.createTextNode(ing.title || '(untitled)'));
      const stats = ingredientFailures(ing).filter((s) => !/^cawg\./.test(s.code));
      const bad = stats.filter((s) => s.code !== 'signingCredential.untrusted').length;
      const untrusted = stats.length > 0 && !bad;
      const nested = ing.active_manifest && ctx.store.manifests && ctx.store.manifests[ing.active_manifest];
      const st = elc('span', 'ing-status' + (bad ? ' bad' : ''),
        bad ? ' · has validation issues' : untrusted ? ' · signer not on the trust lists' : (nested ? ' · carries its own credentials' : ''));
      li.appendChild(st);
      ul.appendChild(li);
      if (nested && !ctx.seen.has(nested.label)) {
        const sub = renderManifest(nested, `Ingredient: ${ing.title || ''}`, ctx);
        sub.classList.add('card');
        li.appendChild(sub);
      }
    }
    card.appendChild(ul);
  }
  return card;
}

function showResult(file, report) {
  $('#result').hidden = false;
  $('#fileName').textContent = file.name;
  $('#fileMeta').textContent = `${file.type || 'unknown type'} · ${fmtBytes(file.size)}`;
  const prev = $('#preview');
  prev.onerror = () => { prev.hidden = true; };
  if (file.type.startsWith('image/')) {
    prev.alt = `Preview of ${file.name}`;
    prev.src = URL.createObjectURL(file);
    prev.hidden = false;
  } else prev.hidden = true;

  const banner = $('#verdict');
  banner.replaceChildren();
  const manifestEl = $('#manifest');
  manifestEl.replaceChildren();
  const rawWrap = $('#rawWrap');
  rawWrap.hidden = true;

  if (report.error) {
    const b = elc('div', 'verdict-msg warn', `Could not read this file: ${report.error}`);
    banner.appendChild(b);
    return;
  }
  const store = report.store;
  const active = store && store.active_manifest && store.manifests && store.manifests[store.active_manifest];
  if (!active) {
    banner.appendChild(elc('div', 'verdict-msg warn', 'No Content Credentials found in this file - it carries no provenance information either way.'));
    postMortem(file, banner);
    return;
  }
  // The verdict comes from the C2PA checks in validation_results (see resultsOf). Identity-assertion
  // (cawg.*) results are shown with the identity itself: an identity nobody can vouch for doesn't
  // make the file itself suspect.
  const results = resultsOf(store);
  const state = store.validation_state;   // 'Trusted' | 'Valid' | 'Invalid'
  let status = results.failure.filter((s) => !/^cawg\./.test(s.code));
  // A detached .c2pa manifest has no content of its own, so the check that ties it to its file (the
  // hard-binding hash) can only fail here: leave that one out, word the verdict for a manifest
  // rather than a file, and say why (after the verdict).
  const sidecar = formatOf(file) === EXT_TYPES.c2pa;
  const unbound = sidecar ? status.filter((s) => /^assertion\.[a-zA-Z]*Hash\.mismatch$/.test(s.code)) : [];
  if (sidecar) status = status.filter((s) => !unbound.includes(s));
  const intact = sidecar ? 'the manifest is intact and validly signed' : 'the file has not been changed since it was signed';
  const Intact = intact[0].toUpperCase() + intact.slice(1);
  const untrustedOnly = status.length > 0 && status.every((s) => s.code === 'signingCredential.untrusted');
  // Green needs positive evidence, not only an absence of failures: the active manifest's signature
  // validated and, with the trust lists loaded, its signer reported trusted with an overall Trusted
  // state (a sidecar's state is Invalid only because of the binding check set aside above).
  const reported = (code) => results.success.some((s) => s.code === code && (s.url || '').includes(`/${store.active_manifest}/`));
  const signedOk = !results.fromResults || reported('claimSignature.validated');
  const trusted = reported('signingCredential.trusted') && (state === 'Trusted' || sidecar);
  // Consistency guard: the SDK calls the manifest invalid, but none of the failures shown explains it.
  const cawgHard = results.failure.some((s) => /^cawg\./.test(s.code) && !/\.untrusted$/.test(s.code));
  const unexplained = state === 'Invalid' && !status.some((s) => s.code !== 'signingCredential.untrusted') && !unbound.length && !cawgHard;
  if (unexplained || (status.length && !untrustedOnly)) {
    const b = elc('div', 'verdict-msg bad', unexplained
      ? '✗ Content Credentials are present but validation FAILED: the validator reports the manifest as invalid without naming a specific check.'
      : `✗ Content Credentials are present but validation FAILED: ${failureKinds(status)}.`);
    const ul = elc('ul');
    for (const s of status.filter((x) => !unexplained || x.code !== 'signingCredential.untrusted')) {
      const li = elc('li');
      const codeLink = elc('a');   // each code has its own row on the codes page
      codeLink.href = `/c2pa-validation-codes/#${codeAnchor(s.code)}`;
      codeLink.title = 'What this code means';
      codeLink.appendChild(elc('code', '', s.code));
      li.appendChild(codeLink);
      li.appendChild(document.createTextNode(` - ${CODE_HINTS[s.code] || s.explanation || ''}`));
      const where = whereOf(s.url);
      if (where) {
        li.appendChild(document.createElement('br'));
        li.appendChild(elc('span', 'where', `Where: ${where}.`));
      }
      ul.appendChild(li);
    }
    if (ul.children.length) b.appendChild(ul);
    const total = Object.keys(store.manifests || {}).length;
    if (total > 1) {
      const affected = new Set();
      for (const s of status) {
        const m = /\/c2pa\/([^/]+)\//.exec(s.url || '');
        if (m) affected.add(m[1]);
      }
      const okCount = total - affected.size;
      if (affected.size && okCount > 0) {
        b.appendChild(elc('div', 'affected',
          `Affected: ${affected.size} of ${total} manifests (${[...affected].join(', ')}). The other ${okCount} report${okCount === 1 ? 's' : ''} no issues.`));
      }
    }
    banner.appendChild(b);
  } else if (!status.length && signedOk && trustEnabled && trusted) {
    // Which list vouched for the signer (inspect() checks again against the official lists alone):
    // the frozen interim CAI list is still trusted, but the CAI asks validators to tell the two apart.
    const src = report.trustSource;
    const onList = src === 'interim' ? 'the interim trust list' : src === 'unknown' ? 'a trust list' : 'the C2PA trust lists';
    const b = elc('div', 'verdict-msg good', `✓ Content Credentials are present and valid - ${intact}, and the signer is on ${onList}.`);
    if (src === 'interim') {
      b.appendChild(elc('div', 'trust-note', 'Note: the signer is on the interim trust list, not the official C2PA trust list. The interim list is the Content Authenticity Initiative’s earlier list of known signers, superseded by the C2PA trust list and frozen since 1 January 2026: nothing new is added, and the certificates already on it remain valid.'));
    } else if (src === 'unknown') {
      b.appendChild(elc('div', 'trust-note', 'Note: c2paview could not tell whether the signer is on the official C2PA trust list or only on the older interim list.'));
    }
    banner.appendChild(b);
  } else if (!status.length && signedOk && !trustEnabled) {
    // Green means the signer is trusted; without the lists that was never checked, so amber.
    banner.appendChild(elc('div', 'verdict-msg warn', `✓ ${Intact} - but the trust lists could not be loaded, so the signer was not checked against them and can’t be verified. Judge the issuer name below as you would an unknown email sender.`));
  } else if (untrustedOnly && signedOk) {
    const b = elc('div', 'verdict-msg warn', `✓ ${Intact} - but the signer is not on the C2PA trust lists, so the identity of the signer can\u2019t be verified. Judge the issuer name below as you would an unknown email sender.`);
    banner.appendChild(b);
  } else {
    // No failure named, but not enough positive evidence for either message above: fail closed.
    banner.appendChild(elc('div', 'verdict-msg warn', `Content Credentials are present, but the checks didn’t all come back conclusive (validation state: ${state || 'not reported'}), so neither the file’s integrity nor its signer can be confirmed. Treat the details below with care.`));
  }
  if (sidecar) {
    banner.appendChild(elc('div', 'verdict-msg none', 'This is a detached manifest (a .c2pa sidecar file). Its signature and contents are checked, but not that it belongs to a particular image or video: that needs the original file, which carries the content the manifest’s hash covers.'));
  }

  const count = Object.keys(store.manifests || {}).length;
  const ctx = { store, results, reader: report.reader, urls: report.urls, seen: new Set() };
  manifestEl.appendChild(renderManifest(active, count > 1 ? `Active manifest (of ${count} in the file)` : 'Manifest', ctx));

  $('#raw').textContent = JSON.stringify(store, rawReplacer, 2);
  rawWrap.hidden = false;
}

// ------------------------------------------------------------------ stripping post-mortem
// When a file has no credentials, look for leftovers a metadata stripper can leave behind: XMP
// provenance pointers and JUMBF fragments survive some pipelines that drop the manifest. These are
// plain byte matches in the first 64 MB, so they are shown as clues, never as proof either way.
async function postMortem(file, banner) {
  let text;
  const cap = Math.min(file.size, 64 * 1048576);
  try {
    text = new TextDecoder('latin1').decode(new Uint8Array(await file.slice(0, cap).arrayBuffer()));
  } catch (e) { return; }
  const traces = [];
  if (text.includes('dcterms:provenance')) traces.push('The text "dcterms:provenance" appears. XMP metadata uses it to point to a C2PA manifest, and none could be read from this file.');
  if (/https?:\/\/[^"'<>\s]{4,200}\.c2pa/.test(text)) traces.push('A web address ending in .c2pa appears. Credentials may be stored there rather than in the file (this viewer only reads embedded manifests).');
  if (text.includes('contentauth:urn:uuid') || text.includes('c2pa_manifest')) traces.push('Text that looks like a C2PA manifest identifier appears.');
  // A C2PA manifest store box header (jumb, then a jumd box whose type starts "c2pa"), not just the
  // two words near each other: XMP's own "self#jumbf=/c2pa/..." pointer matched that looser test.
  if (/jumb.{4}jumdc2pa/s.test(text)) traces.push('Bytes that look like a JUMBF/C2PA block appear, but no readable manifest. One may have been cut short by an editor or converter.');
  const wrap = elc('div', 'verdict-msg none');
  if (traces.length) {
    wrap.appendChild(document.createTextNode('Possible traces of earlier credentials (clues, not proof):'));
    const ul = elc('ul');
    for (const t of traces) ul.appendChild(elc('li', '', t));
    wrap.appendChild(ul);
    wrap.appendChild(elc('div', '', 'These are simple byte matches: they can also turn up by chance, or in a file that only mentions C2PA. If credentials were removed, common culprits are image compressors, CMS/social-media uploads, screenshots, format conversion and "save for web" exports.'));
  } else {
    wrap.appendChild(document.createTextNode(`A simple byte search${file.size > cap ? ' of the first 64 MB' : ''} found no traces of earlier credentials either. That doesn\u2019t show the file never had any: re-encoding, screenshots and most upload pipelines remove them without a trace.`));
  }
  banner.appendChild(wrap);
}

// ------------------------------------------------------------------ reading
// The Reader of the file on show stays open for its thumbnails; it is freed (and its object URLs
// revoked) when the next file is read. `seq` stops a slow read from overwriting a newer one.
let current = null, seq = 0;
const release = (r) => { try { Promise.resolve(r && r.free()).catch(() => {}); } catch (e) { /* already freed */ } };
// The active manifest's signer was reported trusted (the same test the green verdict uses).
function signerTrusted(store) {
  const active = store && store.active_manifest;
  return !!active && resultsOf(store).success.some((s) => s.code === 'signingCredential.trusted' && (s.url || '').includes(`/${active}/`));
}
// A trusted signer may be on the official C2PA trust list or only on the frozen interim CAI list:
// read the file again against the official lists alone. 'official' | 'interim', or 'unknown' if that
// second read fails. Runs only for trusted results, so a file that can't go green costs no extra read.
async function officialOrInterim(c2pa, file) {
  let r = null;
  try {
    const official = await officialContextReady;
    if (!official) return 'unknown';
    r = await Reader.fromBlob(c2pa, formatOf(file), file, official);
    const s = r ? await r.manifestStore() : null;
    return signerTrusted(s) ? 'official' : 'interim';
  } catch (e) {
    return 'unknown';
  } finally { release(r); }
}
async function inspect(file) {
  const mine = ++seq;
  $('#result').hidden = false;
  $('#verdict').replaceChildren(elc('div', 'verdict-msg none', 'Reading…'));
  $('#manifest').replaceChildren();
  if (current) {
    for (const u of current.urls) URL.revokeObjectURL(u);
    release(current.reader);
    current = null;
  }
  // Once `current` holds the Reader the next read frees it; until then every exit must free it here,
  // including a manifestStore() that throws.
  let reader = null;
  try {
    const c2pa = await c2paReady;
    const context = await contextReady;
    reader = await Reader.fromBlob(c2pa, formatOf(file), file, context);   // null: no manifest
    const store = reader ? await reader.manifestStore() : null;
    if (mine !== seq) { release(reader); return; }
    const trustSource = signerTrusted(store) ? await officialOrInterim(c2pa, file) : undefined;
    if (mine !== seq) { release(reader); return; }
    current = { reader, urls: [] };
    reader = null;
    showResult(file, { store, reader: current.reader, urls: current.urls, trustSource });
  } catch (e) {
    release(reader);
    if (mine === seq) showResult(file, { error: readError(e) });
  }
}

// ------------------------------------------------------------------ wiring
const drop = $('#drop');
$('#browse').addEventListener('click', () => $('#file').click());
$('#file').addEventListener('change', (e) => { if (e.target.files[0]) inspect(e.target.files[0]); });
for (const ev of ['dragenter', 'dragover']) drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); });
for (const ev of ['dragleave', 'drop']) drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); });
drop.addEventListener('drop', (e) => {
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) inspect(f);
});
const SAMPLES = {
  sample: ['samples/signed.jpg', 'sample-signed.jpg', 'image/jpeg'],
  sampleZeroFake: ['samples/enoggera-creek.png', 'enoggera-creek.png', 'image/png'],
};
for (const [id, [url, name, type]] of Object.entries(SAMPLES)) {
  $('#' + id).addEventListener('click', async () => {
    const blob = await (await fetch(url)).blob();
    inspect(new File([blob], name, { type }));
  });
}

// ------------------------------------------------------------------ PWA
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
// Installed app opened via "Open with" (file_handlers): inspect the handed file directly.
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (params) => {
    if (params.files && params.files.length) inspect(await params.files[0].getFile());
  });
}
// Android share sheet: the service worker parked the shared file under a one-time id (see sw.js).
// First delete every expired entry: older than INBOX_TTL (same value as in sw.js), or with no time
// at all (the old single key). That includes this page's own, so a late pickup can't open an expired
// file. Then take this page's file, if still there, and delete it at once.
const INBOX = 'share-inbox', INBOX_TTL = 5 * 60 * 1000;
const inboxNotice = (text) => { $('#result').hidden = false; $('#verdict').replaceChildren(elc('div', 'verdict-msg warn', text)); };
(async () => {
  const shared = new URLSearchParams(location.search).get('shared');
  if (shared !== null) history.replaceState(null, '', '/');
  let file = null;
  try {
    if ('caches' in window && await caches.has(INBOX)) {
      const c = await caches.open(INBOX);
      for (const req of await c.keys()) {
        const res = await c.match(req);
        const age = Date.now() - Number(res && res.headers.get('X-Shared-At'));
        if (!(age >= 0 && age < INBOX_TTL)) await c.delete(req);
      }
      if (/^[0-9a-f]{32}$/.test(shared || '')) {
        const key = `/inbox/${shared}`, res = await c.match(key);
        try {
          if (res) {
            const blob = await res.blob();
            file = new File([blob], decodeURIComponent(res.headers.get('X-File-Name') || 'shared-file'), { type: blob.type });
          }
        } finally { await c.delete(key); }
      }
    }
  } catch (e) { /* storage unavailable */ }
  if (file) inspect(file);
  else if (shared === 'too-large') inboxNotice('Could not read the shared file: it is larger than 1 GB, the most this viewer can read.');
  else if (shared) inboxNotice('The shared file could not be opened here. Try sharing it again, or choose it above.');
})();

// Test hook (ReferenceFiles/c2paview-sdk-ab/): showResult takes a synthetic store to exercise the verdict logic.
window.__C2PA = { inspect, ready: c2paReady, showResult };
