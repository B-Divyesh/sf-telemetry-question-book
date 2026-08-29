# Adversarial first-read review 2 — Telemetry Question Book

**Verdict: FAIL**

Reviewed 29 August 2026 UTC against <https://telemetry-question-book.sociobot.in> from fresh Chromium 1.58.2 contexts at 390 × 844 and 1440 × 900. Product code was not modified. Two earlier claim-contract findings remain half-fixed and are blocking again under their original IDs. Thirteen new major or minor findings remain. All 20 declared claim commands pass, but several claims are not fully exercised by their tagged tests and several README promises are absent from the manifest.

## Cold first read

Before scrolling, my answers were:

- **What does this do?** It keeps recurring telemetry answers from readings that a person enters or imports.
- **For whom?** Support teams that need answers without broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This blocking gate passes at both sizes. The exact first-screen text that supplied the answers was “Track recurring answers from approved readings,” “For support teams: enter a reading or approved CSV. The app does not query dashboards,” and “Try it with sample data,” followed by “Opens a filled question book in one click.” The phone also showed all three fact lines. At 1440 × 900, the facts started at y = 903 px and were outside the viewport; that separate first-screen structure defect is F-2-7.

The cold landing load created no local- or session-storage keys. It requested only the page, its same-origin JS/CSS, and the same-origin hero image. There were no console or page errors.

## Findings

### Blocking

#### F-1-5 — The earlier card-retention claim is still not fully tested

- **Earlier finding:** `.factory/review-1.md` F-1-5 required one tagged test for the exact owner, freshness limit, threshold, and approved source before and after reload.
- **Exact location:** `tests/claims.spec.ts:69-81`, `@claim:card-fields`.
- **Observed evidence:** The test checks all four fields and the source URL before reload. After reload it checks owner, freshness, and threshold, but neither the source name nor source URL. The live source does remain visible after reload, so this is a verification gap rather than a reproduced data-loss bug.
- **Why this remains blocking:** The polish report says “verify all four promised fields before and after reload,” but the code does not do that. The claim “Saved question cards retain and show owner, freshness limit, threshold, and approved source after reload” remains broader than its one tagged test.
- **Concrete fix:** After `page.reload()`, assert `Approved Grafana view` and the exact `/sample-sources/northstar-orders` link as well as the other three fields. Keep the existing claim wording only when all four checks pass on both sides of the reload.

#### F-1-6 — Registered claims are still broader than their tagged assertions

- **Earlier finding:** `.factory/review-1.md` F-1-6 required each registered claim to be scoped to exactly what its tagged test proves.
- **Exact locations and gaps:**
  - `@claim:csv-validation` says the form and CSV enforce required fields, HTTPS, and whole-minute values from 1 through 10,080. The test exercises CSV values, then checks only the form input’s `type`, `min`, and `max` attributes. It never tries to submit form values 0, 1, 1.5, 10,080, or 10,081, a blank required field, or a malformed HTTPS URL.
  - `@claim:free-core` promises that editing, CSV import, JSON download, and expiring links are free. Its tagged test checks that controls exist and no checkout selectors exist; it does not complete those four results inside that test.
  - `@claim:least-privilege-input` says the form accepts approved HTTPS links. Its tagged test checks `type="url"`, the credential warning, and absence of password inputs, but never saves a valid HTTPS source.
  - `@claim:api-rate-limit` says create, open, and revoke routes share one allowance. Its tagged test calls an isolated `createRateLimiter` with a local `Map`; it never calls the three route handlers against one shared counter.
- **Why this remains blocking:** These are the same claim-to-test mismatch class that polish 1 marked closed. Passing commands do not prove the unexercised outcomes. The contract requires the observable result, not control or attribute presence.
- **Concrete fix:** Extend each tagged test to complete the claimed result. For rate limiting, invoke create, open, and revoke handlers in one deterministic integration test and verify that their combined 101st call returns `429` with `Retry-After` while a second client remains allowed.

### Major

#### F-2-1 — CSV enum and date promises are unlisted claims

- **Exact quote/location:** `README.md:55`: “`comparison` accepts `gte`, `lte`, or `eq`.” and “`observedAt` accepts an ISO date.”
- **Why this matters:** `.factory/claims.json` has no claim that names either accepted comparison values or date validation. The existing CSV validation test does not exercise them.
- **Concrete fix:** Add a registered CSV-schema claim and tagged test covering each accepted comparison, an unknown comparison, a valid ISO date, and invalid dates; or remove the promises.

#### F-2-2 — The offline limitation for sharing is unlisted

- **Exact quote/location:** `README.md:45`: “Creating or opening an expiring link still needs a connection.”
- **Why this matters:** The offline claim proves that the visited demo reopens, but no manifest entry or tagged test proves the stated boundary for creating and opening links.
- **Concrete fix:** Register the limitation and test offline create/open errors plus successful recovery after reconnecting, or remove this sentence.

#### F-2-3 — Demo token separation and automatic revocation are absent from claim wording

- **Exact quote/location:** `README.md:61`: “Demo links use a separate token prefix.” and “Reset demo and Start for real revoke them.”
- **Why this matters:** `@claim:demo-controls` happens to assert revocation and `@claim:expiring-share` happens to inspect a `d_` token, but neither claim text promises these outcomes. The public claim inventory therefore omits two statements visitors can rely on.
- **Concrete fix:** Expand the appropriate claim entries so their text names the `d_` separation and Reset/Start revocation already exercised by the tagged tests.

#### F-2-4 — Metadata minimization and deletion-on-revoke are unlisted privacy claims

- **Exact quote/location:** `README.md:63`: “The metadata table keeps only the opaque token, deadline, demo flag, and revocation-key hash.” and “Revocation deletes the payload immediately.”
- **Why this matters:** `snapshot-retention` checks that metadata lacks `payload` at creation, not that only the stated application fields exist. `share-revocation` proves a later read returns `410`, not that the stored payload was deleted immediately. These privacy promises are stronger than the registered evidence.
- **Concrete fix:** Add tagged storage tests that compare the metadata key set and inspect the payload queue immediately after revocation, then add matching claim entries. Otherwise narrow the README to the outcomes already tested.

#### F-2-5 — The health-route exemption is an unlisted claim

- **Exact quote/location:** `README.md:65`: “`/api/health` is read-only and exempt.”
- **Why this matters:** An untagged API test covers the behavior, but `.factory/claims.json` has no entry for it. The review contract requires every public claim to appear in the manifest.
- **Concrete fix:** Add a `health-rate-limit` claim whose exact tagged test verifies read-only output and continued availability after the snapshot allowance is exhausted, or remove the sentence from public README copy.

#### F-2-6 — A local question book has no complete backup export

- **Exact location:** `/book` and `/demo` offer **Import CSV**, **Download CSV template**, and per-answer **Download JSON**, but no export of all saved question cards.
- **Why this matters:** Questions live only in browser storage, and the privacy page tells users that clearing storage removes them. A normal engineering/support pair will expect a round-trip backup before trusting an ongoing book to device-local storage.
- **Concrete fix:** Add **Export question book CSV** using the documented columns. Test that exporting and importing into a clean real workspace reproduces every card without duplicates. In demo mode the download must contain only demo cards and must not read real storage. Register the claim.

#### F-2-7 — The desktop first screen omits all three required facts

- **Exact location:** 1440 × 900 cold `/`; `.plain-facts` starts at y = 903 px and ends at y = 984 px.
- **Exact hidden text:** “Data stays in this browser.” “Works after the first visit, even offline.” “Free to use. No account needed.”
- **Why this matters:** The standard first-screen shape requires privacy, offline, and price facts before scrolling. The oversized 494 px headline pushes all three below a common laptop viewport.
- **Concrete fix:** Reduce the desktop headline scale or vertical gaps so the complete fact list ends above 900 px. Add a 1440 × 900 regression that asserts each fact intersects the initial viewport.

### Minor

#### F-2-8 — The focused mobile skip link intercepts the Demo navigation link

- **Exact location:** 390 × 844 `/`, after one Tab press. The focused skip link occupies x = 12–236.7 and y = 12–60.8 at z-index 100. The Demo link occupies x = 119.8–163.8 and y = 16–64.
- **Observed result:** Clicking the visible Demo label activates the overlapping skip link and changes the URL to `/#main` instead of `/demo`. Playwright also reports that the skip link intercepts pointer events.
- **Why this matters:** A visitor who switches from keyboard to pointer after revealing the skip link cannot activate the navigation item they can see.
- **Concrete fix:** Place the revealed skip link below the 88 px header, or size and position it so it never overlaps header controls. Add a hybrid-input regression: Tab once, click Demo, expect `/demo`.

#### F-2-9 — “Opaque answer links” is unexplained jargon

- **Exact quote/location:** `README.md:15`: “Creates opaque answer links that expire after 1 hour, 24 hours, or 7 days.”
- **Why this matters:** “Opaque” does not tell a general reader what is hidden.
- **Concrete rewrite:** “Creates answer links with random IDs that expire after 1 hour, 24 hours, or 7 days.”

#### F-2-10 — “First-party snapshot API” describes implementation, not the result

- **Exact quote/location:** `README.md:61`: “Creating an expiring link sends the reviewed copy to the first-party snapshot API.”
- **Why this matters:** “First-party” and “API” require platform context and do not say where the data goes in reader terms.
- **Concrete rewrite:** “Creating an expiring link sends the reviewed copy to this site’s sharing service.”

#### F-2-11 — “Opaque token” is unexplained jargon

- **Exact quote/location:** `README.md:61`: “The URL holds only an opaque token.”
- **Why this matters:** The useful fact is that the answer is not embedded in the link.
- **Concrete rewrite:** “The link contains a random ID, not the answer.”

#### F-2-12 — The storage paragraph is written in infrastructure terms

- **Exact quotes/location:** `README.md:63`: “The customer-data payload is a storage-queue message with the chosen time to live.” and “The metadata table keeps only the opaque token, deadline, demo flag, and revocation-key hash.”
- **Why this matters:** “Payload,” “storage-queue,” “time to live,” “metadata table,” and “revocation-key hash” make a user-facing privacy explanation depend on Azure implementation vocabulary.
- **Concrete rewrite:** “The reviewed answer is stored separately until its chosen expiry time. The service keeps the link ID, expiry time, demo status, and a one-way code used for revocation.” Keep vendor-level details in an operator note.

#### F-2-13 — A historical repair instruction remains in the main README

- **Exact quote/location:** `README.md:83`: “Candidate `fa32cba` stored payloads in the metadata table. Run `npm --prefix api run cleanup:legacy` once with `SnapshotStorage` set before deploying this repair.”
- **Why this matters:** The current repository is at `3418c08`, the live repair is already recorded as deployed, and a new operator cannot tell whether this one-time migration is still required. Historical candidate lore obscures the current deployment procedure.
- **Concrete fix:** Move the old-candidate migration record to the handoff or a dated migration note. In README, state only the current condition under which the cleanup command must run.

## Demo, sandbox, privacy, and offline evidence

- One click from `/` opened `/demo` with three named samples and a sticky “Demo — sample data, nothing is saved” banner.
- At 390 × 844, the first card’s Northstar question, `1,842` value, “On track” state, and “Fresh for 60 min” text all intersected the first viewport.
- Changing the value to `1,999`, then choosing **Reset demo**, restored `1,842`.
- Pre-seeded real question, preview, and share sentinels remained byte-for-byte unchanged through Reset, answer-copy creation, and **Start for real**.
- A demo share used a `d_` token, returned `200` before leaving demo, and returned `410` after **Start for real**. No `demo:` local- or session-storage key remained.
- The full landing, demo update, answer-copy, share, Reset, Start, and offline flow requested only `https://telemetry-question-book.sociobot.in`. No analytics, external font/script, model, account, payment, or telemetry-query origin appeared.
- After a service-worker-controlled online reload, `/demo` reopened offline with all three cards and the offline notice.
- No Azure or model key exists in client source. No AI request occurred. This is correct for this brief: it explicitly says not to generate explanations with an LLM, and the threshold workflow has no missing AI step.

## Claim execution

I cloned the untouched review base locally to `/tmp/tqb-review2-clean-ZpN2Vw/repo`, ran `npm ci`, and ran every exact `test` command from `.factory/claims.json` independently. Results:

| Claim | Exact command result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `card-fields` | PASS; incomplete post-reload assertion, F-1-5 |
| `local-browser` | PASS |
| `free-core` | PASS; existence-only coverage gap, F-1-6 |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS; form behavior not exercised, F-1-6 |
| `csv-template` | PASS |
| `answer-copy-security` | PASS |
| `answer-copy-download` | PASS |
| `expiring-share` | PASS |
| `share-redaction` | PASS |
| `share-revocation` | PASS |
| `least-privilege-input` | PASS; accepted-save result not exercised, F-1-6 |
| `sample-sources` | PASS |
| `snapshot-retention` | PASS |
| `api-rate-limit` | PASS; routes not integrated in the tagged test, F-1-6 |

No declared command failed. The unlisted public claims are F-2-1 through F-2-5. Passing adjacent tests does not add missing claims to the manifest.

## Copy audit

Counting rule: whitespace-delimited words; hyphenated terms, URLs, paths, and version numbers count as one word. Headings, navigation labels, actions, alt text, status labels, commands, and link labels are included so contextless copy is not skipped. No unit exceeds 22 words. No supplied banned word appears. Copy flags are F-2-9 through F-2-13.

### Landing page

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 4 | Skip to main content | Pass |
| 2 | 3 | Telemetry Question Book | Pass |
| 3 | 1 | Demo | Pass |
| 4 | 3 | My question book | Pass |
| 5 | 1 | Privacy | Pass |
| 6 | 5 | Approved readings · plain answers | Pass |
| 7 | 6 | Track recurring answers from approved readings | Pass |
| 8 | 9 | For support teams: enter a reading or approved CSV. | Pass |
| 9 | 6 | The app does not query dashboards. | Pass |
| 10 | 5 | Try it with sample data | Pass; result-naming primary action |
| 11 | 8 | Opens a filled question book in one click. | Pass |
| 12 | 5 | Data stays in this browser. | Pass |
| 13 | 7 | Works after the first visit, even offline. | Pass |
| 14 | 3 | Free to use. | Pass |
| 15 | 3 | No account needed. | Pass |
| 16 | 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 17 | 4 | One approved reading in. | Pass |
| 18 | 4 | One answer copy out. | Pass |
| 19 | 2 | Live preview | Pass |
| 20 | 5 | Check the latest approved readings | Pass |
| 21 | 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass; claim-test gap F-1-5 |
| 22 | 3 | Approved Grafana view | Pass |
| 23 | 4 | Did Northstar orders arrive? | Pass |
| 24 | 2 | 1,842 orders | Pass |
| 25 | 2 | On track | Pass |
| 26 | 3 | 12 min ago | Pass; captured value |
| 27 | 4 | Fresh for 60 min | Pass |
| 28 | 3 | Owner Data Platform | Pass |
| 29 | 6 | Passes when at least 1,500 orders | Pass |
| 30 | 3 | Read-only Kibana link | Pass |
| 31 | 4 | Are Atlas webhooks clearing? | Pass |
| 32 | 2 | 7 queued | Pass |
| 33 | 2 | On track | Pass |
| 34 | 3 | 26 min ago | Pass; captured value |
| 35 | 4 | Fresh for 45 min | Pass |
| 36 | 2 | Owner Reliability | Pass |
| 37 | 6 | Passes when at most 10 queued | Pass |
| 38 | 6 | Three steps to keep answers current | Pass |
| 39 | 5 | How the question book works | Pass |
| 40 | 3 | Name the question | Pass |
| 41 | 8 | Write the customer question and assign its owner. | Pass |
| 42 | 4 | Add an approved reading | Pass |
| 43 | 10 | Paste a read-only link or import an approved CSV export. | Pass |
| 44 | 3 | Share the answer | Pass |
| 45 | 5 | Create an expiring answer link. | Pass |
| 46 | 9 | Choose whether to hide the owner, source, and note. | Pass |
| 47 | 7 | What the question book does not do | Pass |
| 48 | 3 | It translates readings. | Pass |
| 49 | 5 | It does not replace telemetry. | Pass |
| 50 | 7 | It does not ingest logs or metrics. | Pass |
| 51 | 6 | It does not write query language. | Pass |
| 52 | 7 | It does not alert or monitor systems. | Pass |
| 53 | 6 | It never asks for dashboard credentials. | Pass |
| 54 | 6 | Plain answers from approved telemetry readings. | Pass |
| 55 | 1 | Privacy | Pass |
| 56 | 1 | Terms | Pass |
| 57 | 6 | Built by Param Factory (external site) | Pass |
| 58 | 10 | Version 1.2.0 · Generated illustration disclosed in the design notes. | Pass |

### README

| # | Line | Words | Exact copy | Result |
| ---: | ---: | ---: | --- | --- |
| 1 | 1 | 3 | Telemetry Question Book | Pass |
| 2 | 3 | 6 | Track recurring answers from approved readings. | Pass |
| 3 | 3 | 15 | This browser-based app is for engineering and support pairs who cannot share broad dashboard access. | Pass |
| 4 | 5 | 8 | Enter a reading or import an approved CSV. | Pass |
| 5 | 5 | 6 | The app does not query dashboards. | Pass |
| 6 | 5 | 14 | The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. | Pass |
| 7 | 5 | 8 | It works after the first visit, even offline. | Pass |
| 8 | 7 | 9 | Try the isolated sample at `/demo`, `/?demo=1`, or `https://telemetry-question-book.sociobot.in/demo`. | Pass |
| 9 | 7 | 15 | Demo changes use `demo:` storage keys and never read or change the real question book. | Pass |
| 10 | 9 | 3 | What it does | Pass |
| 11 | 11 | 7 | Saves approved question cards in the browser. | Pass |
| 12 | 12 | 9 | Updates a recurring reading without making a duplicate card. | Pass |
| 13 | 13 | 9 | Imports new CSV rows and updates matching question names. | Pass |
| 14 | 14 | 9 | Marks readings as on track, needs attention, or stale. | Pass |
| 15 | 15 | 14 | Creates opaque answer links that expire after 1 hour, 24 hours, or 7 days. | F-2-9 |
| 16 | 16 | 10 | Lets the creator revoke an answer link before it expires. | Pass |
| 17 | 17 | 6 | Downloads dated answer copies as JSON. | Pass |
| 18 | 18 | 8 | Hides the owner, source, and note by default. | Pass |
| 19 | 19 | 10 | Accepts approved HTTPS links and never asks for dashboard credentials. | Claim-test gap F-1-6 |
| 20 | 21 | 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass |
| 21 | 23 | 2 | Run locally | Pass |
| 22 | 25 | 7 | Requirements: Node.js 20 or newer and npm. | Pass |
| 23 | 28 | 2 | `npm ci` | Pass; command |
| 24 | 29 | 3 | `npm run dev` | Pass; command |
| 25 | 32 | 2 | Open `http://localhost:5173`. | Pass |
| 26 | 32 | 6 | The direct demo URL is `http://localhost:5173/?demo=1`. | Pass |
| 27 | 34 | 3 | Test and build | Pass |
| 28 | 37 | 2 | `npm test` | Pass; command |
| 29 | 38 | 3 | `npm run lint` | Pass; command |
| 30 | 39 | 3 | `npm run typecheck` | Pass; command |
| 31 | 40 | 3 | `npm run build` | Pass; command |
| 32 | 43 | 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. | Pass |
| 33 | 43 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass |
| 34 | 45 | 14 | After one online visit, the app caches the files it needs to reopen offline. | Pass |
| 35 | 45 | 10 | Creating or opening an expiring link still needs a connection. | Unlisted claim F-2-2 |
| 36 | 47 | 2 | CSV format | Pass |
| 37 | 49 | 8 | Use Download CSV template in the question book. | Pass |
| 38 | 49 | 3 | Required columns are: | Pass |
| 39 | 52 | 1 | `question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note` | Pass; schema line |
| 40 | 55 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Unlisted claim F-2-1 |
| 41 | 55 | 5 | `observedAt` accepts an ISO date. | Unlisted claim F-2-1 |
| 42 | 55 | 5 | Source URLs must use HTTPS. | Pass; claim-test gap F-1-6 |
| 43 | 55 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | Pass; claim-test gap F-1-6 |
| 44 | 57 | 3 | Data and sharing | Pass |
| 45 | 59 | 4 | Real questions use `tqb:v1`. | Pass |
| 46 | 59 | 4 | Demo questions use `demo:tqb:v1`. | Pass |
| 47 | 59 | 9 | Real and demo answer previews use separate session-storage keys. | Pass |
| 48 | 59 | 6 | Preview data never enters the URL. | Pass |
| 49 | 61 | 13 | Creating an expiring link sends the reviewed copy to the first-party snapshot API. | F-2-10 |
| 50 | 61 | 7 | The URL holds only an opaque token. | F-2-11 |
| 51 | 61 | 9 | The service checks expiry and revocation on every read. | Pass |
| 52 | 61 | 7 | Demo links use a separate token prefix. | Unlisted claim F-2-3 |
| 53 | 61 | 8 | Reset demo and Start for real revoke them. | Unlisted claim F-2-3 |
| 54 | 63 | 13 | The customer-data payload is a storage-queue message with the chosen time to live. | F-2-12 |
| 55 | 63 | 14 | Azure Storage removes that message automatically at expiry, even when nobody requests the link. | Pass |
| 56 | 63 | 14 | The metadata table keeps only the opaque token, deadline, demo flag, and revocation-key hash. | F-2-4, F-2-12 |
| 57 | 63 | 5 | Revocation deletes the payload immediately. | Unlisted claim F-2-4 |
| 58 | 65 | 16 | The anonymous snapshot routes share an allowance of 100 requests per client in each 60-second window. | Claim-test gap F-1-6 |
| 59 | 65 | 9 | This allowance covers create, open, and revoke requests together. | Claim-test gap F-1-6 |
| 60 | 65 | 7 | Request 101 returns HTTP `429` with `Retry-After`. | Claim-test gap F-1-6 |
| 61 | 65 | 5 | `/api/health` is read-only and exempt. | Unlisted claim F-2-5 |
| 62 | 67 | 9 | Downloaded files do not expire or provide access control. | Pass |
| 63 | 67 | 6 | Do not put secrets in them. | Pass |
| 64 | 67 | 8 | The app has no account service or analytics. | Pass |
| 65 | 67 | 4 | See `/privacy` and `/terms`. | Pass |
| 66 | 69 | 1 | Pricing | Pass |
| 67 | 71 | 9 | This release is free and has no purchase flow. | Pass |
| 68 | 73 | 1 | Deployment | Pass |
| 69 | 75 | 13 | Run `npm run build`, then deploy `dist/` with the managed functions in `api/`: | Pass |
| 70 | 78 | 3 | `/opt/fleet/lib/deploy-static.sh telemetry-question-book dist` | Pass; command |
| 71 | 81 | 19 | The Static Web App needs a secret `SnapshotStorage` app setting that points to the approved first-party Azure Storage account. | Pass; operator copy |
| 72 | 81 | 8 | The connection needs Table and Queue service access. | Pass; operator copy |
| 73 | 81 | 4 | Never commit its value. | Pass |
| 74 | 81 | 13 | Set non-secret `BUILD_ID` to the deployed commit; `/api/health` reports it for parity checks. | Pass; operator copy |
| 75 | 83 | 8 | Candidate `fa32cba` stored payloads in the metadata table. | F-2-13 |
| 76 | 83 | 14 | Run `npm --prefix api run cleanup:legacy` once with `SnapshotStorage` set before deploying this repair. | F-2-13 |
| 77 | 83 | 11 | The command strips every already-expired legacy payload without opening its link. | F-2-13 |
| 78 | 85 | 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. | Pass; operator copy |
| 79 | 85 | 8 | Azure Static Web Apps reads it during deployment. | Pass; operator copy |
| 80 | 87 | 2 | Project notes | Pass |
| 81 | 89 | 2 | Visual system | Pass; link label |
| 82 | 90 | 2 | Verified claims | Pass; link label |
| 83 | 91 | 2 | Demo contract | Pass; link label |
| 84 | 92 | 2 | Build handoff | Pass; link label |
| 85 | 94 | 2 | MIT licensed. | Pass |
| 86 | 94 | 2 | See LICENSE. | Pass |

## Structure, routing, accessibility, and visual identity

- Direct loads of `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, `/demo/snapshot`, and all three sample-source routes returned `200`. An unknown route returned the designed document with HTTP `404`.
- Each audited route at both sizes had `lang=en`, one `h1`, one `main`, a route-specific title, description, canonical, Open Graph title, Twitter card, favicon, Apple touch icon, no missing image alt, and no horizontal overflow.
- Titles follow the route/product pattern and remain under 60 characters. The three sample sources have distinct titles. The sitemap lists all fixed application routes; opaque share URLs are dynamic and `noindex`.
- A normal in-app navigation to Demo focused its `h1`; Back returned to `/`, restored scroll 0, and focused the landing `h1`.
- Crawling every link from valid routes returned `200` for HTTP links; the two contact links are explicit `mailto:` links. The deliberate 404 page’s own skip link correctly points to its 404 document and was not counted as a product dead link.
- Sixteen live axe scans covering core routes, a sample source, and 404 at both sizes found zero serious or critical violations. No visible mobile target was below 44 × 44 px. The skip-link overlap remains F-2-8.
- The mid-century instrument console, cream/forest/amber palette, hard-edged controls, paper cards, and generated console art match `.factory/design.md` and are distinct from a generic SaaS template.
- The landing title, image metadata, security headers, CSP, robots file, sitemap, footer, Privacy, Terms, and designed 404 are present. F-2-7 is the remaining skeleton defect.

## History audit

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the complete current `.factory/handoff.md`. Each earlier finding was checked on the live site and in current code/tests.

| Earlier finding | Independent result |
| --- | --- |
| F-1-1 phone demo sample below fold | Fixed: all four required Northstar details intersect 390 × 844. |
| F-1-2 demo overwrote real preview/lost banner | Fixed: separate keys, banner, real sentinels, cleanup, and live revocation all verified. |
| F-1-3 expiring share absent | Fixed: opaque server link, expiry, redaction, and revocation work. |
| F-1-4 broad “safely” claim/manual step hidden | Fixed in headline, title, and first-screen lede. |
| F-1-5 card-content promise untested | **Half-fixed; BLOCKING again.** Source is not asserted after reload. |
| F-1-6 registered claims broader than assertions | **Half-fixed; BLOCKING again.** Current gaps are listed above. |
| F-1-7 sample titles generic | Fixed: all three are distinct live and in metadata code. |
| F-1-8 sitemap omitted transient routes | Fixed: `/snapshot` and `/demo/snapshot` are listed. |
| F-1-9 404 shell/metadata incomplete | Fixed: consistent navigation/footer and metadata are present. |
| F-1-10 “governed” jargon | Fixed: “approved.” |
| F-1-11 “support-ready” adjective | Fixed: “answer copy.” |
| F-1-12 unclear preview heading | Fixed: “Check the latest approved readings.” |
| F-1-13 “point-in-time”/“redaction” jargon | Fixed in landing and README. |
| F-1-14 “My book” terminology | Fixed: “question book.” |
| F-1-15 contextless operating-loop heading | Fixed. |
| F-1-16 contextless boundaries heading | Fixed. |
| F-1-17 “local-first” README jargon | Fixed. |
| F-1-18 service-worker/shell jargon | Fixed. |
| F-1-19 deployment jargon sentence | Fixed as previously requested; new data-sharing jargon is F-2-9 through F-2-12. |

The current handoff’s operational statements were also checked against the code and full test suite. Its “no release-blocking gap remains” conclusion is superseded by this review because the earlier claim-test gaps above are still present.

## Repository verification

From the clean clone:

- `npm ci`: PASS; 105 packages, zero audit findings.
- All 20 exact claim commands: PASS independently.
- `npm test`: PASS; 13 API tests and 24 Playwright tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` produced.
- `npm audit --audit-level=high`: PASS, zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: PASS, zero vulnerabilities.
- Production JS: 34,648 bytes raw / 11.27 kB gzip. CSS: 16,808 bytes raw / 4.79 kB gzip.

## What would make this perfect

Close F-1-5 and F-1-6 with result-level tagged assertions; register or remove every unlisted README promise; add a complete question-book CSV export and round-trip test; fit the three facts into the desktop first viewport; prevent the focused skip link from covering navigation; replace the flagged security/storage jargon; and remove the stale candidate migration note from the main README. Then rerun this entire review from fresh browser and storage contexts. There is no appropriate AI feature to add.
