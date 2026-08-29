# Independent product verification 5 — PASS

## Decision

**PASS — candidate `a94723f6cb93b951d7efed99838e256c5e585e9a` satisfies the acceptance contract.**

- Tested candidate: `a94723f6cb93b951d7efed99838e256c5e585e9a` (`main`, initially clean and equal to `origin/main`)
- Tested deployment: <https://telemetry-question-book.sociobot.in>
- Verified: 29 August 2026 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium 1208
- Product code was not modified.

No critical, high, medium, or low product defects were found.

## Mandatory first-read and demo gate

**PASS.** A cold live load answers all three questions in the first screen:

- What it does: **“Track recurring answers from approved readings.”**
- Who it is for: **“For support teams: enter a reading or approved CSV.”**
- What to do first: **“Try it with sample data”**, beside **“Opens a filled question book in one click.”**

The action opened `/demo` in one click. At 390 × 844 it showed the persistent **“Demo — sample data, nothing is saved”** banner, Reset demo, Start for real, three named sample questions, and the first reading. Direct `/demo` and `/?demo=1` entry also worked. The live desktop and mobile visual inspection found no clipping, overlap, or ambiguous primary action.

## Required claim gate

`.factory/claims.json` exists. After the clean lockfile install, every listed command was executed separately and exactly as written. **25/25 passed.** Each claim ID occurs in exactly one tagged test.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `card-fields` | PASS |
| `local-browser` | PASS |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `offline-sharing` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS |
| `csv-schema` | PASS |
| `csv-template` | PASS |
| `question-book-export` | PASS |
| `answer-copy-security` | PASS |
| `answer-copy-download` | PASS |
| `expiring-share` | PASS |
| `share-redaction` | PASS |
| `share-revocation` | PASS |
| `least-privilege-input` | PASS |
| `sample-sources` | PASS |
| `snapshot-retention` | PASS |
| `snapshot-storage-minimization` | PASS |
| `api-rate-limit` | PASS |
| `health-rate-limit` | PASS |

A literal command attempt before dependency installation could not start TypeScript or load the Azure packages because a clean clone has no `node_modules`. This was setup, not a claim assertion. After the required `npm ci` and `npm --prefix api ci`, all 25 exact commands above passed with no claim failure.

The live landing page, Privacy, Terms, README, and product workflow were cross-checked against the registry. No unlisted user-facing capability claim was found.

## Clean-checkout gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 105 packages, 0 vulnerabilities |
| `npm --prefix api ci` | PASS; 29 packages, 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 14/14 API tests and 29/29 Playwright tests |
| `npm run build` | PASS; produced `dist/index.html` |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |
| `npm --prefix api audit --audit-level=high` | PASS; 0 vulnerabilities |

The exact build output is 35,859 bytes JS (11,645 bytes gzip), 16,907 bytes CSS (4,826 bytes gzip), zero font files, and a 42,650-byte mobile hero. These are comfortably inside the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

## End-to-end product behavior

Fresh local-production and live runs covered the smallest useful job:

- Empty real question book → add a question → reject an HTTP source → correct it to HTTPS → save → reload persistence: PASS.
- Zero value, zero threshold, `lte`, and one-minute freshness boundary: PASS.
- Update an existing reading without creating a duplicate: PASS.
- Reject a CSV with missing fields, then recover with a quoted comma and the 10,080-minute maximum: PASS.
- Import/update de-duplication, CSV template download, full-book CSV export and round trip: PASS.
- Create redacted and unredacted answer previews without putting answer data in the URL: PASS.
- Download the reviewed JSON, create an opaque expiring link, open it, revoke it, and observe the unavailable state: PASS.
- Cancel and confirm deletion, reset demo, leave demo, and preserve real/demo storage isolation: PASS.
- Freshness values `0`, `1`, `1.5`, `10080`, and `10081`, all three comparisons, malformed dates, and malformed URLs are covered by passing claim tests.

The workflow fulfills the researched brief without ingesting telemetry, generating queries, alerting, or exposing dashboard credentials. No AI feature is present, matching the brief’s v1 constraint.

## Privacy, network, and server checks

A fresh live demo/update/share/open/revoke run made 27 browser requests. Every request used `https://telemetry-question-book.sociobot.in`; there were no analytics, third-party fonts/scripts, account, dashboard-query, alerting, billing, or model requests. Normal reading changes remained in `demo:` browser keys. The only network writes were explicit same-origin snapshot actions.

The redacted live share used opaque ID `d_a58a296dc82a4d97bfd178961c24b4cf`; its URL contained no question or value. It opened without owner/source/note, revoked with `204`, and then returned `410`. All snapshot responses used `Cache-Control: no-store`. The deliberate post-revocation request produced the expected browser failed-resource message; normal routes and workflows had no console or page errors.

Fresh production API evidence:

- Invalid snapshot type: `400` with a plain recovery error.
- Ten concurrent creates: ten `201` responses and ten unique IDs.
- Ten concurrent reads: ten `200` responses with the expected payload.
- Ten concurrent correct revocations: ten `204` responses.
- One-second link: immediate `200`, then `410` with `reason: "expired"`.
- Wrong revocation key: `403`; the answer remained `200`; correct key then returned `204`, followed by `410`.
- The prior 31 allowed validation/concurrency requests left 69 allowances. Additional requests 1–69 were allowed; request 70 (combined request 101) returned `429`, `X-RateLimit-Limit: 100`, `X-RateLimit-Remaining: 0`, and `Retry-After: 39`.
- `/api/health` still returned `200` after saturation, with no rate-limit headers: `{"ok":true,"snapshotStoreConfigured":true,"buildId":"telemetry-question-book-repair-3-29c993d"}`.

Observed production allowance: **100 create/open/revoke requests per client per 60 seconds, shared across those routes; request 101 is blocked.** Health is exempt.

## Accessibility, keyboard, mobile, and routes

- `/opt/fleet/lib/verify-url.sh` passed for `/` and `/?demo=1`: HTTP 200, titles, `lang=en`, one `h1`, `<main>`, complete image alt text, labeled buttons, and zero load errors.
- Fresh axe matrix: local and live, eight routes, desktop 1440 × 900 and mobile 390 × 844. **32 scans, zero serious or critical findings.**
- Every normal route had one `h1`, one `<main>`, `lang=en`, complete alt text, a distinct title, same-origin requests, and no horizontal overflow.
- Mobile found no visible interactive target below 44 × 44 CSS pixels.
- Keyboard testing reached the visible skip link first, reached and activated the sample-data action, opened the answer dialog, closed it with Escape, and restored focus to Make answer copy.
- The focused skip link/button used a designed 3 px visible outline. Back navigation moved focus to the restored page heading.
- Reduced motion changed the answer-ticket animation to `0.00001s`.
- All ten sitemap routes returned `200`, the external Param Factory link resolved to `200`, and an unknown live route returned the designed HTTP `404`.

## PWA, headers, caching, and performance

The live service worker controlled `/demo`, had one active `tqb-shell-v7` cache, and had no waiting or installing update after `registration.update()`. After an online visit and reload, a forced-offline reload retained all three sample cards, showed the offline notice, and logged no error.

Static pages send HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and a same-origin CSP with `frame-ancestors 'none'`. HTML, service worker, and manifest revalidate after 30 seconds. Hashed JS/CSS use one-year immutable caching. Non-hashed hero assets revalidate daily. API responses use `no-store`.

Fresh mobile Lighthouse:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 1.0 s |
| LCP | 1.3 s |
| TBT | 50 ms |
| CLS | 0 |

## Deployment parity

All 14 public files from the candidate build matched production byte-for-byte by SHA-256: HTML, JS, CSS, 404 HTML/CSS, service worker, manifest, robots, sitemap, favicon, Apple touch icon, both hero images, and social preview. The current JS hash was `d06232b52e049ba50353d4f81d535b8f14fb6b7543ceffa16e9a08ef3035504e`.

The live API reports build `29c993d`, which is an ancestor of the candidate. `git diff 29c993d..a94723f -- api ':!api/tests'` is empty, so the candidate contains exactly the same production API source. Live lifecycle, validation, concurrency, persistence, expiry, revocation, allowance, and health behavior also matched the candidate tests.

## Design, documentation, and applicability

The mid-century instrument-panel visual system is product-specific and documented in `.factory/design.md`, including palette, type, spacing, motion, original generated asset prompt, and provenance. The live product uses that system consistently rather than a generic framework layout. README, MIT LICENSE, Privacy, Terms, demo documentation, claims registry, and handoff are present.

This is not a library or CLI, so consumer pack/install testing does not apply. It has no sign-in, so Entra authority testing does not apply. This release is explicitly free and has no purchase flow, so paid-unlock testing does not apply.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release recommendation

Release candidate `a94723f6cb93b951d7efed99838e256c5e585e9a` is accepted.
