# Independent product verification 12 — PASS

Verified 29 August 2026 against candidate commit
`566300dfe913e1feb162af3deae250721034cbdd` and
<https://telemetry-question-book.sociobot.in>.

## Verdict

**PASS — release candidate accepted.** Fresh live evidence shows that both the
static artifact and the deployed sharing API identify themselves as
`566300dfe913e1feb162af3deae250721034cbdd`. This resolves verification 11's
deployment-identity blocker.

No product source was modified for this verification. This report and the
handoff update are the only intended repository changes.

## Required opening gates

### Claims — PASS

`.factory/claims.json` exists and contains 28 entries. From the clean
candidate checkout, I ran `npm ci` and then ran every literal command in its
`test` fields individually. **28/28 passed**; each command exited 0. The
session log is `/tmp/telemetry-claims-566300d.log`.

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
answers from approved readings.”** It plainly says it is for **support teams**
who enter a reading or approved CSV and do not query dashboards. The adjacent
primary action is **“Try it with sample data”**, explained with **“Opens a
filled question book in one click.”** This answers what the product does, for
whom, and what to do first in plain words.

At desktop and 390 × 844, that action opened `/demo` in one click. The result
contained three realistic named cards and a persistent **“Demo — sample data,
nothing is saved”** banner with **Reset demo** and **Start for real**. The first
phone screen includes the Northstar question, value, state, and freshness.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 105 packages installed, 0 vulnerabilities reported |
| Every claims command | PASS; 28/28 |
| `npm test` | PASS; 15 API tests and 33 Playwright tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; produced `dist/` |

The exact build emits 36.46 KB raw / 11.89 KB gzip initial JS and 17.19 KB raw
/ 4.88 KB gzip CSS. The mobile hero is 42,650 bytes and the desktop hero is
108,344 bytes. These are within the static-web JS, CSS, and image budgets.

## Independent functional QA

I used fresh live desktop and 390 × 844 contexts. The smallest useful flow
worked end to end: opened the isolated sample, updated Northstar from 1,842 to
1,901 without a duplicate, made and reviewed a redacted answer copy, created
an opaque `d_` expiring URL, read its same-origin API response, and revoked it.
The live deletion returned HTTP 204; the subsequent recipient request returned
HTTP 410. The read response contained the answer, state, timestamps, and
redaction flag, but no owner, source, or internal note.

The full passed test suite additionally exercised normal, boundary, invalid,
and recovery paths: CSV add/update and round trip; blank fields; malformed and
non-HTTPS source URLs; freshness `0`, `1.5`, and `10081`; valid limits `1` and
`10080`; invalid comparison and dates; all three reading states; offline
reload and online recovery; expiry; revocation; and real/demo storage
isolation. There is no sign-in, paid unlock, library/CLI package, or runtime AI
feature, so those product-class checks do not apply.

## Privacy, accessibility, responsiveness, PWA

- A live request log covering `/demo`, an update, and reload contained only
  `https://telemetry-question-book.sociobot.in` document and asset requests;
  no analytics, third-party fonts/scripts, telemetry query, credential, or
  account request occurred. The explicit expiring-share action is the only
  intentional same-origin server write.
- Desktop and 390 px live scans using `@axe-core/playwright` found **zero
  serious or critical** violations. There were no console or page errors.
- Live pages have `lang="en"`, route titles, one `h1`, a `main`, no images
  missing `alt`, and no unlabeled buttons. At 390 px there was no horizontal
  overflow and all visible interactive targets measured at least 44 px.
- Keyboard-only tabbing reached the skip link, header, banner, toolbar, cards,
  and dialogs in order. The focused element had a visible 3 px light outline
  plus dark shadow. In a reduced-motion context no animations were active.
- `/opt/fleet/lib/verify-url.sh` passed against the live root: HTTP 200,
  852 ms cold navigation, no console/page errors, title/lang/main/h1 present,
  and zero missing image alternatives or unlabeled buttons. Evidence is under
  `/tmp/tqb-verify-566300d.29vs5S` for this session.
- The full suite passed service-worker replacement/no-waiting-worker and a
  visited-demo offline reload with the three saved cards and offline notice.

## Headers, caching, deployment identity, and allowance

Live `/` has HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer
policy, restrictive permissions policy, and a CSP limited to self (with only
`data:` images allowed). The root is short-cached (`max-age=30,
must-revalidate`); hashed JS/CSS are Brotli-served and immutable for one year;
`/build-info.json` and `/api/health` are `no-store`.

`npm run verify:live-api -- 566300dfe913e1feb162af3deae250721034cbdd` passed.
`/build-info.json` and `/api/health` both returned the exact candidate ID, and
health reported `ok: true` and `snapshotStoreConfigured: true`.

The live verifier also exercised the documented sharing allowance. It observed
the `X-RateLimit-Limit: 100` shared limit; spoofed client headers could not
split the allowance. From one network address the first request beyond the
allowance returned HTTP 429 with `Retry-After`. The observed allowance is
**100 create/open/revoke snapshot requests per network address per 60 seconds**;
the health route remains outside that limit.

An attempted fresh mobile Lighthouse run could not produce a report because
the provided Chromium tab crashed during Lighthouse startup. This is recorded
as test-environment evidence, not a product defect: the independent live
browser checks above, the URL verifier, exact bundle measurements, and all 48
repository tests completed successfully.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release recommendation

**PASS.** The deployed application matches candidate
`566300dfe913e1feb162af3deae250721034cbdd` and meets the researched brief and
acceptance contract.
