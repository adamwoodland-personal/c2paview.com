# c2paview.com

**Live: <https://c2paview.com/>**

Drop any image, video or audio file and inspect its C2PA Content Credentials - who signed it,
when, with what tool, whether it is AI-generated, and whether it has been altered since signing.
Free, runs entirely in your browser, no account, no adverts, and the file is never uploaded.

Guides on the site: [How to check if an image is AI-generated](https://c2paview.com/check-if-image-is-ai-generated/),
[What is C2PA?](https://c2paview.com/what-is-c2pa/) and
[C2PA validation codes explained](https://c2paview.com/c2pa-validation-codes/).

## What it does

- Reads the C2PA manifest store from JPEG, PNG, WebP, AVIF, GIF, TIFF, SVG, MP4, MOV, MP3, WAV,
  PDF and `.c2pa` sidecar files.
- Validates it locally: content hashes, claim signature and certificate chain, via the official
  [c2pa-web](https://github.com/contentauth/c2pa-js) SDK (`@contentauth/c2pa-web`: the Content Authenticity Initiative's open-source C2PA
  library, `c2pa-rs`, compiled to WebAssembly and self-hosted here).
- Shows the story in plain language: signer, signing time, claim generator, producer, the actions
  performed ("opened", "adjusted colour", "AI-generated"), and the ingredient tree with
  thumbnails - plus the raw manifest JSON for the curious.
- Shows CAWG identity assertions ("Who vouches for it"): who is named, how it is proven and what
  they vouch for, with its own validation result.
- Explains failures: each C2PA validation code (for example `assertion.dataHash.mismatch`) comes
  with a plain-English line saying what it means.

A green result means the file is unchanged since signing and its signer's certificate is on the
C2PA trust lists. If the signer is not on them, or the lists could not be loaded, the result is
amber and the issuer name is shown so you can judge it yourself. A red result says what failed:
the content (changed since signing), the credentials themselves, or the signer's certificate.
The bundled sample is `CA.jpg` from the
[c2pa-rs test fixtures](https://github.com/contentauth/c2pa-rs), signed with the C2PA test
certificate.

## Privacy

No backend, no cookies, no analytics, no uploads. The WASM validator runs in a worker in your
tab; load the page, go offline, and it still works.

A file shared to the installed app from Android's share sheet waits in the browser's cache on your
device until the page opens it, and is deleted as soon as it is read. The page won't open one more
than 5 minutes old. If the handoff is interrupted, the file stays in that cache until the next
visit, share or app update after those 5 minutes clears it. Nothing deletes it on a timer.

## Licence

MIT for this site's own code - see [LICENSE](LICENSE). Bundled: `@contentauth/c2pa-web` and its
WASM build of c2pa-rs (MIT, Content Authenticity Initiative), and its dependency `highgain` (ISC); sample image from the c2pa-rs test suite
(MIT/Apache-2.0).

Built by Adam Woodland with the assistance of AI (Anthropic Claude).
