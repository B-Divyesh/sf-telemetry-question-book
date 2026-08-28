# Independent product verification — FAIL

## Decision

**FAIL — do not release candidate `a74497cd00ba50776aea7d381ee4fe2e0101c9e6`.**

- Candidate: `a74497cd00ba50776aea7d381ee4fe2e0101c9e6`
- Branch at start: `main`, clean and equal to `origin/main`
- Live URL: `https://telemetry-question-book.sociobot.in`
- Verified: 28 August 2026, UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium 1208
- Product code was not changed during verification.

The landing/demo gate passes, all eight declared claim commands pass after `npm ci`, the full suite and build pass, and the live files match the candidate. Release still fails because snapshot expiry and integrity can be bypassed, recurring readings cannot update an existing question, the paid checkout is not registered, and the claims contract is incomplete. Additional accessibility, validation, link, 404, and dependency defects remain.

## Mandatory first-read gate

**PASS.** In a cold 1440 × 900 browser, the first screen says:

- What it does: “Answer recurring telemetry questions safely.”
- For whom: “For support teams who need current answers without broad dashboard access.”
- What to click first: “Try it with sample data,” next to “Opens a filled question book in one click.”

That single click opened `/demo`, displayed the persistent “Demo — sample data, nothing is saved” banner, and immediately showed three realistic questions. The same information and action are present in the initial 390 × 844 viewport.

Evidence: `.factory/qa/first-read-desktop.webp`, `.factory/qa/first-read-mobile.webp`, and `.factory/qa/browser-qa-results.json`.

## Claims gate

`.factory/claims.json` exists. After the required clean lockfile install, every exact declared command passed:

| Claim | Result | Observable assertion |
| --- | --- | --- |
| `demo-sandbox` | PASS | `/demo`, banner, three cards, demo-only storage key |
| `local-browser` | PASS | snapshot flow made same-origin requests only |
| `threshold-states` | PASS command, deficient coverage | asserts two “On track” and one “Stale”; never asserts “Needs attention” although the claim includes it |
| `offline-reload` | PASS | three cards and offline notice survive reload offline |
| `csv-import` | PASS | valid row creates a fourth card with its reading |
| `snapshot-controls` | PASS command, deficient coverage | expired fixture is hidden and owner is absent; generated expiry duration and source/note redaction are not asserted |
| `least-privilege-input` | PASS | URL input, warning, and no password input |
| `paid-support-pack` | PASS command, deficient/live failure | mocked verification and filename only; it does not inspect pack contents or exercise purchase, which is 404 live |

The full `npm test` run passed 9/9. The initial pre-install invocations could not start because `tsc` was not installed; they were rerun successfully after `npm ci` and are not counted as product failures.

The claims registry is nevertheless not compliant with the supplied claims contract. The visible/documented CSV-template download, snapshot JSON download, Reset demo behavior, and Start for real cleanup have no claim entries. Several registered tests only prove part of their stated claim, as noted above. The independent workflow did verify those behaviors, but that does not replace required claim entries and tagged tests.

## Release-blocking defects

### High — snapshot expiry and answer integrity are client-side illusions

Snapshots are plain, unsigned Base64 JSON in the URL fragment. Anyone who has a snapshot link can decode data after the displayed expiry, change `expiresAt`, or replace the question, status, and answer before re-encoding the fragment.

Fresh browser reproduction:

1. Create an unredacted demo snapshot.
2. Decode the fragment; it contains owner, source, note, answer, timestamps, and status as plain JSON.
3. Change the question to `Forged customer answer`, answer to `0 incidents`, status to `On track`, and set a future expiry.
4. Re-encode and open it. The live app displays the forged answer as a normal snapshot.
5. Put `CUSTOMER-SECRET-4242` in an expired snapshot. The UI hides it, but decoding the unchanged fragment still returns the secret.

This fails the brief’s explicit requirement that snapshots containing customer data need expiry, and an unsigned snapshot cannot be treated as a governed support answer. Redaction remains useful, and fragments are not sent in HTTP requests, but neither property supplies expiry or integrity to a recipient.

### High — recurring readings cannot update an existing question

Question cards have Add, Snapshot, and Delete actions but no Edit or Update reading action. Importing the same named question again appends another card with a new random ID. A live fresh-state probe imported the same recurring question twice with values 10 and 11 and produced two identically named cards.

The core job is to answer the same customer-impact question repeatedly from current telemetry. Requiring users to create a duplicate and delete the old card for every reading is not an end-to-end implementation of that job.

### High — the advertised paid purchase is unavailable

The visible “Buy Support Pack” link points to:

`https://api.sociobot.in/api/v1/products/telemetry-question-book/checkout`

Fresh GET result:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

License verification exists, but a new customer cannot purchase the advertised `$49 once` product. The mocked claim test cannot prove live availability.

### High — the claim manifest does not prove all visitor-facing promises

Under the supplied acceptance contract, unlisted claims and materially partial claim tests fail review. Specific gaps are recorded in the Claims gate above. In particular, “Needs attention,” actual generated expiry duration, all three redacted fields, downloaded paid content, CSV-template download, snapshot JSON download, Reset demo, and Start for real cleanup are not fully represented and asserted by the declared claim tests.

## Other defects

### Medium

1. **All demo source links are dead.** Each visible “Open approved source” link returns 404:
   - `https://example.com/approved/northstar-orders`
   - `https://example.com/approved/atlas-webhooks`
   - `https://example.com/approved/harbor-export`
2. **CSV import bypasses required-field validation.** A row with blank question, owner, source, and unit plus `sourceUrl=https://` imports successfully. The manual form rejects equivalent invalid input. CSV also omits the form’s 10,080-minute maximum.
3. **Touch targets miss the required 44 × 44 px floor at 390 px.** Measured: home wordmark 38 × 38, Demo nav link 31.3 × 48, and footer Privacy/Terms links about 25 px high.
4. **The focus ring misses the 3:1 non-text contrast requirement on the paper surface.** `#d96f32` against `#f2e9d8` measures 2.779:1. The ring is present and keyboard navigation works.
5. **The real 404 document violates its own CSP.** `/missing.png` correctly returns HTTP 404, but `404.html` uses an inline `<style>` while live `style-src` is `'self'`. Chromium reports a CSP console error and renders it unstyled.
6. **The pinned Vite 7.1.3 development dependency has current high-severity arbitrary-file-read advisories.** `npm audit` reports one high direct vulnerability with a non-major fix at 7.3.6. `npm audit --omit=dev` reports zero production vulnerabilities; the built static files do not contain Vite.

### Low

1. Extensionless unknown SPA routes render the designed not-found screen but return HTTP 200 rather than 404.
2. Non-hashed illustration filenames are served with one-year `immutable` caching, so an in-place art update could remain stale.
3. Cards render the phrase “Passes at at least …” or “Passes at at most …”.
4. After adding a demo card, the heading still says “These three examples,” even though four cards are present.

## End-to-end and recovery evidence

The following passed on both local production output and the live site in fresh browser contexts:

- Empty real book and first-question path.
- Native rejection of an HTTP source URL, correction to HTTPS, save, and reload persistence.
- Zero values, equality threshold, and one-minute freshness boundary.
- Missing-column CSV error with a specific recovery instruction.
- Quoted commas in question/note and a valid 10,080-minute maximum CSV import.
- CSV-template download.
- Default-redacted and explicitly unredacted snapshots.
- Malformed snapshot recovery screen.
- Delete cancellation and confirmation.
- Demo reset, Start for real, and separation of `demo:tqb:v1` from `tqb:v1`.
- Browser Back restores the landing route and focuses its `h1`.
- Snapshot dialog receives focus and Escape restores focus to the opening control.

No console or page errors occurred in normal workflows.

## Accessibility, responsive behavior, and motion

- Independent axe scans: zero serious/critical findings on `/`, `/demo`, `/book`, `/privacy`, `/terms`, malformed `/snapshot`, and the SPA not-found route at 1440 × 900 and 390 × 844, local and live.
- Semantic smoke test: `lang=en`, one `h1`, one `main`, titles, canonical URLs, and image alt text all present on those routes.
- Keyboard: skip link is first and visible; demo is reachable and opens with Enter; dialog focus/restoration works; no trap observed.
- Focus style: 4 px solid ring is rendered, with the contrast defect noted above.
- Reduced motion: snapshot animation computes to `0.00001s`; active-button transform is removed.
- 390 px: no horizontal overflow on tested routes. Visual inspection found no clipped content.
- Zoom is not disabled in the viewport metadata.
- Touch-size failures are listed above.

## Privacy, network, security, and API behavior

- Normal landing, demo, authoring, snapshot, privacy, and terms flows requested only the product origin. No analytics, third-party fonts, or third-party scripts were observed.
- Real questions use `tqb:v1`; demo questions use `demo:tqb:v1`. Independent pre-seeding confirmed neither mode reads or overwrites the other.
- License verification is the only runtime cross-origin request and CORS allows the live origin. It sends the token to `api.sociobot.in`, as disclosed.
- Live response headers include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and restricted camera/microphone/geolocation permissions.
- API rate limit passes: in one sequential rapid burst, requests 1–30 to the license verification endpoint returned 200; request 31 returned 429 with `Retry-After: 2`.
- No sign-in exists, so Entra External ID is not applicable.
- Snapshot expiry/integrity and 404 CSP defects are detailed above.

## Offline and service-worker behavior

- After unregistering workers and clearing caches, the live demo installed `/sw.js`, activated `tqb-shell-v2`, and had no waiting/installing worker after `registration.update()`.
- With the browser then offline, `/demo` reloaded with three cards and the offline notice.
- The service worker is network-first online and falls back to the cached shell for navigation.

## Build, deployment parity, performance, and caching

- `npm ci`: passed; lockfile unchanged.
- `npm test`: 9/9 passed.
- `npm run build`: passed; `dist/index.html` exists.
- No separate lint script is available. TypeScript checking is part of `npm run build` and passed.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console errors, title/lang/main/alt checks passed.
- Live and local SHA-256 values match for all 13 checked deploy artifacts: HTML, hashed JS/CSS, three WebP assets, service worker, manifest, robots, sitemap, 404 document, favicon, and apple-touch icon.
- Live HTML is short cached (`max-age=30, must-revalidate`); hashed assets are one-year immutable; service worker is short cached.
- Bundle sizes: JS 27.49 KB raw / 9.41 KB gzip; CSS 15.46 KB raw / 4.52 KB gzip; fonts 0; mobile hero 42.65 KB; largest hero 108.34 KB. All stated static budgets pass.
- Fresh live mobile Lighthouse: Performance 96, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.3 s, CLS 0, TBT 240 ms. INP is not available from this navigation-only lab run.

Compact evidence is in `.factory/qa/`; the browser script can be rerun while a production preview is listening on `127.0.0.1:4173`.

## Release recommendation

Do not release this candidate. At minimum: use a server-backed opaque snapshot token or an authenticated/encrypted design that truly expires and protects integrity; add an update-reading workflow; register and verify checkout end to end; make every public claim complete and test-backed; replace dead demo links; validate CSV rows equivalently to the form; and close the accessibility/CSP issues.
