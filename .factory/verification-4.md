# Independent verification 4 — PASS

**Candidate:** `036e7551e6b4b912d4b929560e796e3adcc50be0`

**Verified URL:** <https://telemetry-question-book.sociobot.in>

**Date:** 29 August 2026 UTC
**Verdict:** **PASS** — no release-blocking defects found.

## First-read result

Cold-opening the live landing page answers all required questions in plain words:

- **What it does:** “Track recurring answers from approved readings.”
- **Who it is for:** “For support teams”.
- **What to do first:** the first-screen action is **“Try it with sample data”**, with “Opens a filled question book in one click.”

The action opens `/demo`, shows all three realistic cards, and retains the persistent “Demo — sample data, nothing is saved” banner with Reset demo and Start for real. First-read and one-click-demo acceptance both pass.

## Clean-clone gates and claims

- `npm ci`: pass (105 packages; `npm audit` reported zero vulnerabilities).
- Every command declared in `.factory/claims.json` was executed from the demo test entry point. All 20 declared claims passed: `demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`, `free-core`, `threshold-states`, `offline-reload`, `question-update`, `csv-import`, `csv-validation`, `csv-template`, `answer-copy-security`, `answer-copy-download`, `expiring-share`, `share-redaction`, `share-revocation`, `least-privilege-input`, `sample-sources`, `snapshot-retention`, and `api-rate-limit`.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass — 13 API tests and 24 Playwright tests.
- `npm run build`: pass; `dist/` produced. Initial JS is 34,648 bytes raw / 11,270 bytes gzip, CSS is 16,808 bytes raw / 4,790 bytes gzip, and the mobile hero is 42,650 bytes: all within the static-web budgets.

## Product and boundary checks

Using the live demo, I updated Northstar from 1,842 to 1,900 without a duplicate, created a redacted answer copy, confirmed the server payload contained only `answer`, `createdAt`, `demo`, `observedAt`, `question`, `redacted`, `status`, and `version`, then revoked it. The production DELETE returned 204 and a subsequent GET returned 410 with `reason: "revoked"`.

The automated browser claims exercised the representative normal path plus stale/threshold states, malformed CSV and URL input, min/max/non-whole freshness values, CSV update de-duplication, download contents, forged URL fragments, redaction, expiry, reset/leave-demo recovery, and sample-source pages. All passed.

## Privacy, API, deployment, and headers

- Cold live landing requests were only same-origin: document, local JS, local CSS, and the self-hosted hero. The live demo reading workflow likewise made no external request; the explicitly requested share action made only same-origin `POST`/`DELETE` snapshot calls. No analytics, account, dashboard-query, alert, third-party font, or CDN request was observed.
- Live headers include HTTPS/HSTS, `X-Content-Type-Options: nosniff`, strict origin referrer policy, restrictive CSP including `frame-ancestors 'none'`, and a restrictive Permissions-Policy. Hashed JS serves `Cache-Control: public, max-age=31536000, immutable`; page HTML is short-cacheable.
- Live `/api/health` returned 200 and build identity `telemetry-question-book-repair-3-29c993d`. This API commit is an ancestor of the candidate. The deployed JS, CSS, and hero asset matched local candidate `dist/` byte-for-byte by SHA-256.
- Production rate-limit probe used one client and a syntactically valid nonexistent demo token: requests 1–100 returned 404, request 101 and the next four returned 429. The 429 response included `Retry-After: 42`, `X-RateLimit-Limit: 100`, and `X-RateLimit-Remaining: 0`. Observed allowance: **100 shared snapshot-route requests per client per 60 seconds**.
- The live service worker controlled `/demo`; after one online reload, an offline reload retained all three sample cards and showed the offline notice.

## Accessibility and interaction

Live axe scans across `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, a sample-source page, and the designed 404 at both 1440×900 and 390×844 found **zero serious or critical violations**. Every tested normal route had `lang="en"`, one title, one `h1`, one `main`, and no horizontal overflow.

Keyboard testing confirmed the first Tab reaches the skip link with a visible cream outline and dark 6px focus halo; Enter opened the demo; the answer-copy dialog received focus; Escape closed it and restored focus to Make answer copy. Under reduced motion, relevant transitions were `0.00001s`. There were no console or page errors on normal 200-page loads. The deliberately requested 404 produces only the browser’s expected failed-resource message for its 404 document.

## Defects by severity

None found.

## Scope notes

This is a static web product, not a library/CLI and it has no sign-in, paid unlock, or AI feature. Those checks are not applicable. One manually created demo-only link during verification will expire automatically; it contains only the shipped redacted sample answer.
