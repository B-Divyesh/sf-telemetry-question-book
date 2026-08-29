# Independent product verification 11 — FAIL

Verified 29 August 2026 against candidate commit
`c8185b961e1de8276d3283b6c4766d3efe442244` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**FAIL — do not release this candidate.** The deployed API identifies itself as
`bba743887ad538ac40c7901b8741b1eba95d6b9c`, not the required candidate
`c8185b961e1de8276d3283b6c4766d3efe442244`. This is fresh evidence from
`GET /api/health` at 21:23 UTC, so the deployment-integrity acceptance contract
is not met. The live static JS happened to be byte-identical to this candidate's
fresh build, but that cannot establish the identity of the server-side snapshot
functions or permit a candidate release.

No product source was modified. This report and the handoff are the only
repository changes.

## Required opening gates

### Claims — PASS

`.factory/claims.json` exists with 28 entries. Before product QA, I ran
`npm ci`, then every literal `test` command in the file individually against
the product's demo entry point. **28/28 passed.** The exact command log is
available for this verification session at
`/tmp/telemetry-claims-verify-11-stable.log`.

Passed IDs: `demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`,
`free-core`, `threshold-states`, `offline-reload`, `offline-sharing`,
`question-update`, `csv-import`, `csv-validation`, `csv-schema`,
`csv-template`, `question-book-export`, `answer-copy-security`,
`answer-copy-download`, `expiring-share`, `share-expiry-options`,
`share-redaction`, `share-revocation`, `least-privilege-input`,
`sample-sources`, `snapshot-retention`, `snapshot-storage-minimization`,
`api-rate-limit`, `health-rate-limit`, `deploy-integrity`, and
`legacy-migration`.

### Cold first read — PASS

In a fresh live browser context, the first screen says **“Track recurring
answers from approved readings.”** It says this is **for support teams** who
enter a reading or approved CSV rather than query dashboards. The adjacent
primary link is **“Try it with sample data”**, with the literal explanation
**“Opens a filled question book in one click.”**

At both 1440 px and 390 px wide, that link opened `/demo` in one click. The
demo immediately showed three realistic cards, and its persistent banner said
**“Demo — sample data, nothing is saved”** with **Reset demo** and **Start for
real** controls. The first sample card showed its question, `1,842` reading,
On track state, and 60-minute freshness in the first phone viewport.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 105 packages, 0 reported vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS (via build) |
| `npm test` | PASS; 15 API and 33 Playwright tests |
| `npm run build` | PASS; produced `dist/` |
| Exact claims commands | PASS; 28/28 |

The built initial JS is 36.46 KB raw / 11.89 KB gzip and CSS is 17.19 KB raw /
4.88 KB gzip, comfortably below the static-product budget.

## Independent functional QA

Using fresh live desktop and 390 × 844 contexts, I exercised the smallest
useful flow: one-click sample data, a reading update, an answer-copy review,
and an explicit expiring-share creation. The share was an opaque `d_` URL and
the API returned `201`. The demo stored only `demo:tqb:v1` in local storage.

The full clean-checkout suite additionally passed representative boundaries and
recovery paths: blank required fields, invalid/HTTP source URLs, freshness `0`,
`1.5`, and `10081`, minimum `1`, maximum `10080`, malformed CSV, matching CSV
update, stale/on-track/needs-attention state, default redaction, expiry,
revocation, and offline recovery. This static-web product has no sign-in,
library/CLI package, paid unlock, or runtime AI feature; those checks are not
applicable.

## Privacy, accessibility, responsive behavior, and PWA

- Playwright recorded only `https://telemetry-question-book.sociobot.in` during
  the complete live landing/demo/update/share flow. There were no third-party,
  analytics, font-CDN, telemetry-backend, or credential requests. The only
  server write was the explicit same-origin creation of an expiring link.
- Desktop and mobile live scans with `@axe-core/playwright` found **zero
  serious or critical** findings on landing and demo. No console errors or page
  errors occurred.
- `lang="en"`, descriptive titles, one `h1`, a `main` landmark, image alt text,
  a visible skip link, and 44 px-or-larger mobile controls were present. A
  keyboard-only 390 px pass found the skip link and each header/CTA target in
  order with a visible 3 px focus outline. Reduced motion changed animations
  and transitions to `0.00001s`.
- The fresh service worker was active at `/sw.js` with no waiting worker.
  After visiting `/demo`, an offline reload retained three cards and showed the
  offline notice without console errors.
- A fresh mobile Lighthouse run reported Performance **99**, Accessibility
  **100**, FCP **985 ms**, LCP **1,285 ms**, TBT **143 ms**, CLS **0**, and
  61,697 bytes transferred. Chromium emitted a post-audit target-crash warning
  while Lighthouse was closing, but wrote the completed report at
  `/tmp/tqb-lighthouse-verify-11.json`; the Playwright browser checks above
  completed without a crash.

## Headers, caching, and request allowance

The live root and immutable JS use the expected restrictive static-host policy:
HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy,
permissions policy, and CSP limited to `self` (with image `data:` allowed).
HTML and `sw.js` are `max-age=30, must-revalidate`; hashed JS is
`max-age=31536000, immutable`; `/api/health` is `no-store`.

The documented server allowance is live and enforced: the sharing API advertises
`X-RateLimit-Limit: 100`; from one client, 98 successive missing-link requests
returned 404 and the next returned **429** with `X-RateLimit-Remaining: 0` and
`Retry-After: 7`. Two previous explicit share requests from this same verifier
account for the initial remaining count of 97. Thus the observed allowance is
**100 shared snapshot requests per network address per minute**, and it fails
closed as documented once exhausted.

All checked public routes (`/`, `/demo`, `/book`, `/privacy`, `/terms`,
`/snapshot`, `/404`, sample source, `robots.txt`, and `sitemap.xml`) returned
200. The static candidate and live hashed JS SHA-256 were identical:
`78f101830d92946baa8e68c45d5ffa5542ea0ea402a52b9e272c08cdf7d1900d`.

## Deployment identity failure

`GET https://telemetry-question-book.sociobot.in/api/health` returned:

```json
{"ok":true,"snapshotStoreConfigured":true,"buildId":"bba743887ad538ac40c7901b8741b1eba95d6b9c"}
```

The candidate is
`c8185b961e1de8276d3283b6c4766d3efe442244`. Running
`npm run verify:live-api -- c8185b961e1de8276d3283b6c4766d3efe442244` waited
for the expected identity and could not pass because the actual ID remained
`bba743887ad538ac40c7901b8741b1eba95d6b9c`.

## Defects by severity

- **Critical — deployment identity mismatch:** production's server-side API is
  not candidate `c8185b…`; it declares `bba7438…`. This violates the required
  live/candidate integrity check and blocks release, even though the currently
  served static JS matches the candidate.
- High: none found beyond the release-blocking identity defect.
- Medium: none found.
- Low: none found.

## Release recommendation

**FAIL.** Deploy the candidate with `BUILD_ID` set to
`c8185b961e1de8276d3283b6c4766d3efe442244`, then rerun the exact live identity
and rate-limit verification before accepting it.
