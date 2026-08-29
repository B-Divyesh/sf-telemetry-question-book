# Independent product verification 10 — PASS

Verified 29 August 2026 against candidate commit
`09f8b2b36089c7b374a4e35953008207fee0c8b8` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**PASS — this candidate satisfies the acceptance contract and is suitable for
release.** Fresh evidence does not reproduce the earlier deployment-only
failure. The deployed frontend is byte-identical to the candidate, and the live
API reports the candidate's exact 40-character build ID. No critical, high,
medium, or low product defect was found.

Product source was not changed during verification. Only this report and the
verification handoff were added or updated.

## Required opening gates

### Cold first read — PASS

A fresh context opened the live page at 1440 × 900 and 390 × 844. The first
screen answers all three required questions in plain words:

- What it does: **Track recurring answers from approved readings**.
- Who it is for: **support teams** entering a reading or approved CSV without
  giving the app dashboard access.
- What to do first: **Try it with sample data**. Adjacent copy says it opens a
  filled question book in one click.

The action opened `/demo` in one click. It immediately showed three realistic
named readings and the persistent **Demo — sample data, nothing is saved**
banner with **Reset demo** and **Start for real**. The direct `/?demo=1` entry
worked too. The three privacy/offline/price facts fit the first 390 × 844 screen,
and the first reading's question, value, state, and freshness were visible.

### Declared claims — PASS

`.factory/claims.json` exists and contains 28 entries. Before any other product
check, each listed command was invoked from the clean clone. The literal first
invocation could not launch because a clean clone had no installed `tsc`; after
the required `npm ci` lockfile install, every exact claim command was rerun
individually. **28/28 passed with no failed claim assertion.** The initial
missing executable was installation state, not an observable claim failure.

Passed claim IDs:

`demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`, `free-core`,
`threshold-states`, `offline-reload`, `offline-sharing`, `question-update`,
`csv-import`, `csv-validation`, `csv-schema`, `csv-template`,
`question-book-export`, `answer-copy-security`, `answer-copy-download`,
`expiring-share`, `share-expiry-options`, `share-redaction`,
`share-revocation`, `least-privilege-input`, `sample-sources`,
`snapshot-retention`, `snapshot-storage-minimization`, `api-rate-limit`,
`health-rate-limit`, `deploy-integrity`, and `legacy-migration`.

Landing-page and README promises were cross-checked against the registry. No
material unlisted claim was found.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 105 packages, 0 vulnerabilities |
| `npm --prefix api ci` | PASS; 29 packages, 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 15/15 API tests and 32/32 Playwright tests |
| `npm run build` | PASS; exact production build produced `dist/index.html` |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm --prefix api audit --audit-level=high` | PASS; 0 vulnerabilities |
| `git diff --check` | PASS |

The full suite includes the registered claims plus routing, metadata,
accessibility, minimum text size, mobile targets, keyboard/dialog focus, CSP-safe
404, and service-worker update regressions.

## Independent end-to-end exercise

Fresh local-storage and browser contexts covered the smallest useful product on
the live deployment:

- Empty real question book → add a question → reload persistence: PASS.
- Blank required fields, HTTP source, freshness `0`, `1.5`, and `10081` were
  rejected; HTTPS and the minimum `1` were accepted: PASS.
- Zero value and zero equality threshold saved correctly: PASS.
- Updating the reading changed one existing card without duplication: PASS.
- A CSV missing required columns gave a specific recovery instruction; a quoted
  row containing commas and the maximum freshness `10080` then imported: PASS.
- One-click demo showed three cards in isolated `demo:` storage: PASS.
- Updating the Northstar sample retained three cards: PASS.
- Default-redacted sharing created an opaque `d_` URL with no answer data. The
  recipient saw the question and answer but no owner, source, or note: PASS.
- Revocation returned HTTP 204; the same link immediately returned HTTP 410:
  PASS.
- Offline reload retained all three demo cards and showed the offline notice:
  PASS.

Normal routes and workflows produced no unexpected console or page errors. The
designed 404 returned HTTP 404; Chromium's expected failed-document diagnostic
for that deliberately missing URL was not counted as a normal-route error.

## Accessibility, keyboard, responsive behavior, and motion

- Independent axe WCAG 2 A/AA scans found **zero serious or critical findings**
  on `/`, `/demo`, `/book`, `/privacy`, `/terms`, and the designed 404 at both
  1440 × 900 and 390 × 844.
- Every audited route had `lang="en"`, one `h1`, one `main`, and a distinct
  descriptive title. No horizontal overflow occurred.
- A direct text-node sweep found no visible product text below 16 px. A mobile
  sweep found no visible interactive target below 44 × 44 CSS px.
- The first Tab focused the skip link. Its live style was a 3 px cream outline
  with a 6 px dark halo. Enter/Space behavior, dialog initial focus, forward and
  backward focus wrapping, Escape, and focus restoration passed.
- The answer dialog exposed a named dialog, checkbox state, expiry selector, and
  ordinary buttons to accessibility APIs. No keyboard trap was observed.
- Reduced-motion mode shortened the ticket animation to `0.00001s`; no looping
  or flashing content exists.
- The responsive 390 px visual inspection found no clipping, overlap, or lost
  controls. The same reflow is narrower than a 200%-zoom desktop CSS viewport.
- `/opt/fleet/lib/verify-url.sh` passed `/` and `/?demo=1`: correct title,
  language, one `h1`, `main`, image alternatives, labeled buttons, and zero
  normal-load console errors.

## Privacy, requests, headers, and server behavior

The full live demo/update/share/open/revoke/offline flow made 31 recorded browser
requests. **Every request was same-origin** to
`https://telemetry-question-book.sociobot.in`. Before the explicit share action,
only the document, hashed assets, local images, service worker, and cached shell
were requested. No analytics, tracking, account, telemetry-query, alert, CDN
font/script, Azure AI, or payment-provider request occurred.

Real and demo questions use distinct `tqb:v1` and `demo:tqb:v1` namespaces.
Preview data stayed out of URLs. The only server write was the user-triggered
same-origin expiring-share action.

Root and app routes return HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive permissions
policy, and this effective CSP:

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self';
form-action 'self'; frame-ancestors 'none'
```

The documented live allowance is enforced. In a fresh 120-request concurrent
burst from one network client, with caller-controlled forwarding/Azure address
headers rotated on every request, exactly 100 requests were admitted and 20
returned HTTP 429. A follow-up remained 429 with
`X-RateLimit-Remaining: 0` and `Retry-After: 56`. Thus the observed allowance is
**100 combined create/open/revoke requests per network address per 60 seconds**.
Two hundred concurrent `/api/health` checks all returned 200 with no rate-limit
headers.

The live create/read/revoke sequence also confirmed the deployed persistence
boundary. API tests separately prove atomic 100-way admission, all-three-route
sharing of the allowance, fail-closed storage errors, expiry-backed payload
retention, metadata minimization, immediate deletion on revocation, schema
rejection, and legacy migration.

No sign-in exists, so Entra External ID is not applicable. Runtime AI and paid
unlock are intentionally absent under the researched brief. Library/CLI consumer
packaging is not applicable to this static web product.

## Deployment identity, links, caching, and performance

- `/api/health` returned `ok: true`, configured snapshot storage, and exact
  `buildId: 09f8b2b36089c7b374a4e35953008207fee0c8b8`.
- All 14 deployable public artifacts checked, including `index.html`, hashed
  JS/CSS, images, metadata files, the styled 404, and `sw.js`, matched the fresh
  local build byte-for-byte by SHA-256. The host-only
  `staticwebapp.config.json` is correctly not publicly served.
- Every crawled HTTP link returned 200, including all three local sample sources
  and the external factory link. Mail links were explicit. The unknown route
  returned the designed 404.
- HTML and `sw.js` use `max-age=30, must-revalidate`; hashed JS/CSS use
  `max-age=31536000, immutable`; health is `no-store`.
- Fresh service-worker update showed active `/sw.js`, cache `tqb-shell-v7`, and
  no waiting or installing worker. Offline `/demo` reload passed.
- JavaScript: 36,534 bytes raw / 11,872 bytes gzip.
- CSS: 17,192 bytes raw / 4,875 bytes gzip.
- Mobile hero: 42,650 bytes. Largest image: 108,344 bytes. Fonts: 0 bytes.
- Fresh live mobile Lighthouse: **Performance 96, Accessibility 100, Best
  Practices 100, SEO 100**; FCP 1.01 s, LCP 1.31 s, TBT 231 ms, CLS 0, total
  transfer 61,822 bytes. INP is unavailable in a navigation-only lab run.

These results satisfy the static-product bundle and Lighthouse-class budgets.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release recommendation

Release candidate `09f8b2b36089c7b374a4e35953008207fee0c8b8`.
