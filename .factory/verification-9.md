# Independent verification 9 — FAIL

Verified 29 August 2026 against candidate commit
`abdf533913219c166e1d9aa1073e9e0f6f47d7d3` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**FAIL — do not release this candidate.** The previously reported deployment-only
failure does not reproduce: the live frontend is byte-identical to this candidate
and the live API reports its exact build ID. Functional, privacy, performance,
security, and automated accessibility checks pass. One medium-severity manual
finding remains release-blocking because it violates both the attached clarity
baseline and the product's own visual thesis: essential body and reading text is
rendered below the documented minimum size.

## Required opening gates

### Cold first read — PASS

A fresh 1440 × 900 browser context opened the live root. The first screen says it
**tracks recurring answers from approved readings**, identifies **support teams**,
and presents **Try it with sample data** above the fold. Adjacent copy says the
action opens a filled question book in one click. Activating it opens `/demo` with
three named readings and the persistent **Demo — sample data, nothing is saved**
banner. The same action and all three facts fit a 390 × 844 first screen.

### Declared claims — PASS

`.factory/claims.json` exists and contains 28 entries. A literal pre-install
attempt correctly stopped at missing clean-clone dependencies (`tsc` and
`@azure/data-tables`). After the required locked install (`npm ci` and
`npm --prefix api ci`), every exact listed `test` command was rerun serially.
**28/28 passed**:

- demo sandbox/controls, card fields, local-browser privacy, free core,
  threshold states, offline reload/sharing, and update without duplicates;
- CSV import, validation, schema, template, and complete book export;
- answer-copy security/download, expiry choices, opaque sharing, redaction,
  revocation, least-privilege input, and working sample sources;
- retention, storage minimization, shared API rate limit, health isolation,
  deploy integrity, and legacy migration.

No material landing-page or README promise was found without a corresponding
claim. The initial missing-dependency result was setup, not a failed observable
claim; the clean-clone acceptance run includes the required install phase.

## Candidate gates — PASS

- `npm ci` and `npm --prefix api ci`: passed; zero audited vulnerabilities.
- `npm test`: passed — 15/15 Node API tests and 31/31 Playwright tests.
- `npm run lint`, `npm run typecheck`, and exact `npm run build`: passed.
- `npm audit` and `npm --prefix api audit --omit=dev`: zero vulnerabilities.
- `dist/index.html` exists. Built JS is 36,534 bytes raw / 11.91 kB gzip;
  CSS is 17,062 bytes raw / 4.85 kB gzip. Mobile hero is 42,650 bytes.

## Independent live exercise — PASS

An independent Playwright flow performed 47 live checks rather than reusing the
product tests.

- Normal path: created a real local question, saved the 1-minute freshness
  boundary, updated it at the 10,080-minute boundary, and confirmed the changed
  value and one existing card.
- Invalid/recovery path: rejected HTTP source URLs, 0, 1.5, and 10,081 freshness
  values using native form validity, then accepted corrected values.
- Sharing: reviewed the default-redacted Northstar answer, created an opaque
  `d_` link, opened it as a recipient, confirmed owner/source/note were absent,
  revoked it, and saw the plain unavailable-link recovery state.
- Demo/offline: one click loaded three samples in isolated storage; service-worker
  update left no waiting worker; the visited demo reloaded offline with all three
  samples and its offline notice.
- Requests/privacy: 54 requests across the normal flows were all same-origin.
  There were no analytics, font CDN, account, telemetry query, alert, Azure AI,
  or payment-provider calls. No unexpected console errors or page errors occurred.
  The expected negative-path resource messages were one HTTP 410 after revocation
  and the deliberately requested HTTP 404.
- Responsive/keyboard: desktop and 390 × 844 had no horizontal overflow; visible
  mobile targets were at least 44 px; the skip link bypassed header controls;
  answer-dialog focus stayed contained in both directions; reduced-motion mode
  had no running animation.
- Axe found zero serious/critical WCAG 2 A/AA findings on `/`, `/demo`, `/book`,
  `/privacy`, `/terms`, and the designed 404. Each had `lang=en`, one `h1`, and
  one `main`. The factory URL verifier passed cold on `/` and `/?demo=1` with no
  console/page errors, missing alt text, or unlabeled buttons.

## Deployment, headers, persistence, and allowance — PASS

- `/api/health` returned `ok=true`, configured snapshot storage, and exact
  `buildId=abdf533913219c166e1d9aa1073e9e0f6f47d7d3`.
- Fresh production `index.html`, hashed JS, hashed CSS, and the hero asset matched
  live byte-for-byte by SHA-256.
- Root, demo, privacy, terms, book, snapshot, and all three sample-source routes
  returned 200 with distinct titles/canonicals. The designed unknown route returned
  404. Every internal/external HTTP link returned 200; mail links were explicit.
- Root responses carry a self-only CSP including `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial.
  HTML and `sw.js` revalidate after 30 seconds; hashed JS/CSS are immutable for one
  year; `/api/health` is `no-store`.
- The live sharing allowance is **100 create/open/revoke requests per network
  address per 60 seconds**. Requests 1–100 were admitted. Request 101 returned
  **429**, `X-RateLimit-Remaining: 0`, and `Retry-After: 41`. Rotating caller-supplied
  forwarding/Azure headers did not split the allowance. Health remained 200 after
  exhaustion.
- API tests cover 100-way concurrent admission, atomic shared accounting,
  fail-closed storage errors, server-enforced TTL, metadata minimization,
  revocation deletion, and legacy migration. The live create/read/revoke flow
  confirmed the deployed persistence boundary.

## Performance and product surface — PASS

- Fresh live mobile Lighthouse: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.99 s, LCP 1.29 s, TBT 79 ms, CLS 0.
- The social preview is 1200 × 630, apple-touch icon is 180 × 180, and all images
  have explicit alternatives where applicable. No third-party fonts/scripts load.
- The mid-century instrument-panel direction, palette, interaction grammar,
  original generated asset provenance, single-mode rationale, and motion policy
  are recorded in `.factory/design.md` and are visibly product-specific.
- Sign-in, paid unlock, runtime AI, and library/CLI packaging are absent and not
  applicable. The brief explicitly excludes generated explanations.

## Defects by severity

### Medium — release blocker

**Essential text violates the documented minimum size.** `.factory/design.md`
states, “Body never falls below 16 px.” The attached clarity baseline requires
body text at least 16 px on web and 17 pt on mobile. Fresh live computed styles
show:

- first-screen action explanation and all three privacy/offline/price facts: 14 px;
- first-screen image caption: 13 px;
- question-card source labels: 11 px;
- question-card state, age, freshness, owner, and threshold: 12 px;
- mobile demo explanation: 12 px.

This is not merely decorative microcopy: freshness, threshold, owner, state, and
the three first-screen facts are core decision information. The issue reproduces
at both 1440 × 900 and 390 × 844. Axe and Lighthouse do not enforce a minimum font
size, so their perfect accessibility scores do not close this manual contract
failure. Raise essential body/reading text to the documented minimum and recheck
390 px layout, first-screen fit, and touch spacing.

### Critical

None.

### High

None.

### Low

None separately recorded.

## Evidence

Compact machine-readable results are committed under
`.factory/evidence/verification-9/`: all-claim status, independent browser checks,
live headers and links, build health, Lighthouse metrics, observed rate-limit
responses, factory URL reports, and computed sub-16-px text measurements.
