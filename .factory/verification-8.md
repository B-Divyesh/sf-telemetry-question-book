# Independent verification 8 — PASS

Verified 2026-08-29 against candidate commit
`31c7c7f622f5d134d6bfc3062292b7ecf063ae4e` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**PASS — release candidate accepted.** The previously reported deployment-only
failure does not reproduce. The deployed frontend is byte-identical to this
candidate and the live API reports the exact candidate build ID.

No release-blocking defects were found.

## Required opening gates

### Cold first read

Cold-loading the live landing page answers the three required questions in
plain words: it **tracks recurring answers from approved readings**, is **for
support teams**, and tells the visitor to **Try it with sample data**. The
adjacent text says it opens a filled question book in one click. Activating it
opened `/demo` with three named readings and the persistent **Demo — sample
data, nothing is saved** banner.

### Claims

`.factory/claims.json` is present. After `npm ci`, every exact listed command
was run serially from the shipped demo entry point. **26/26 passed**:

- `demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`,
  `free-core`, `threshold-states`, `offline-reload`, `offline-sharing`
- `question-update`, `csv-import`, `csv-validation`, `csv-schema`,
  `csv-template`, `question-book-export`
- `answer-copy-security`, `answer-copy-download`, `expiring-share`,
  `share-expiry-options`, `share-redaction`, `share-revocation`
- `least-privilege-input`, `sample-sources`, `snapshot-retention`,
  `snapshot-storage-minimization`, `api-rate-limit`, `health-rate-limit`

Browser claim commands used `npm test -- --grep @claim:<id>`; API claim
commands used `npm run test:api -- --test-name-pattern @claim:<id>`. Logs are
in `/tmp/tqb-claim-*.log` in the verification container.

## Clean candidate gates

- `npm ci` passed (105 packages installed; zero audited vulnerabilities).
- `npm run lint`, `npm run typecheck`, and exact `npm run build` passed.
- `npm test` passed: 15 Node API tests and 31 Playwright tests.
- Build output exists in `dist/`: JavaScript is 36.51 kB raw / 11.88 kB gzip;
  CSS is 17.03 kB raw / 4.84 kB gzip. This is well inside the 200 kB JS and
  50 kB CSS static-product budgets.
- SHA-256 hashes for live `index.html`, hashed JS, hashed CSS, and `sw.js`
  exactly match the fresh `dist/` output. The live asset names also match this
  build.

## Live product checks

- Normal and recovery paths: loaded the sample, added a valid approved HTTPS
  reading after invalid input was blocked by form validation, created a
  redacted demo answer copy, opened its opaque `d_` link, revoked it, and saw
  the unavailable-link recovery page. The full claims add coverage for blank
  fields, CSV/schema/date errors, freshness bounds 1 through 10,080,
  duplicates, import/export round-trips, all threshold states, expiry, and
  redaction.
- All tested live routes returned their correct state and title: `/`, `/demo`,
  `/book`, `/privacy`, `/terms`, and a sample source returned 200; an unknown
  route returned the designed 404. Robots, sitemap, manifest, icons, and
  404 document returned 200.
- At 1440 x 900 and 390 x 844, the first action is visible, the mobile page
  has no horizontal overflow, and demo has three cards. The 390 px screenshot
  and the first card confirm the product is usable after the one-click demo.
- Keyboard: the skip link and all landing actions tab in order with a visible
  3 px focus outline. Enter on **Try it with sample data** opens `/demo`.
  The answer-copy dialog’s forward and reverse wrap remained inside the modal
  at every stop with the same visible outline.
- Reduced-motion mobile mode had no running animations. A service-worker
  `registration.update()` succeeded; after an online demo visit, `/demo`
  reloaded offline with all three cards and the offline notice.
- Axe (WCAG 2 A/AA) found zero serious or critical issues on `/`, `/demo`,
  `/book`, `/privacy`, and `/terms`. The factory `verify-url.sh` check against
  `/demo` passed: title, `lang=en`, one `h1`, main landmark, image alt text,
  labeled buttons, and zero console/page errors.
- A fresh mobile Lighthouse report emitted Performance **100** and
  Accessibility **100** (LCP 1.3 s, TBT 50 ms, CLS 0). The Lighthouse CLI then
  returned non-zero because its Chrome tab crashed during teardown; the report
  was fully written before that harness-only failure.

## Privacy, headers, deployment, and allowance

- Playwright request logging for cold load and normal demo work recorded only
  `https://telemetry-question-book.sociobot.in`. There are no analytics,
  account, dashboard-query, ingestion, alert, font-CDN, or third-party
  requests. The only API requests were same-origin snapshot POST/DELETE after
  the explicit share action.
- Root response headers include a self-only CSP with `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, strict-origin referrer policy,
  permissions policy, and HSTS. Hashed JS/CSS use one-year immutable caching;
  documents and `sw.js` revalidate after 30 seconds. `/api/health` is
  `no-store`.
- `npm run verify:live-api -- 31c7c7f622f5d134d6bfc3062292b7ecf063ae4e`
  passed. `/api/health` returned configured storage and that exact build ID.
  The live spoof-resistant probe established a shared allowance of **100
  create/open/revoke requests per network address per 60 seconds**; request
  101 returned **429** with a `Retry-After` header. Health remained outside
  this allowance.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

Sign-in, paid unlock, library/CLI packaging, and runtime AI are not present
and are not applicable to the researched static, local-first scope.
