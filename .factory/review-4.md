# Adversarial first-read review 4 — Telemetry Question Book

**Verdict: FAIL**

Reviewed 29 August 2026 UTC against
<https://telemetry-question-book.sociobot.in> from fresh Chromium 1.58.2
contexts at 390 × 844 and 1440 × 900. Product code was not modified. One
blocking, one major, and two minor findings remain. All 26 declared claim
commands pass, but two public statements are broader than those passing tests
and three deployment guarantees are absent from the claim inventory.

## Cold first read

Before scrolling, my answers were:

- **What does this do?** It tracks recurring answers from readings that a person enters or imports.
- **For whom?** Support teams that need answers without broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This gate passes at both sizes. The exact text supplying those answers is
“Track recurring answers from approved readings,” “For support teams: enter a
reading or approved CSV. The app does not query dashboards,” and “Try it with
sample data,” followed by “Opens a filled question book in one click.” At
390 px, the primary action ends at 554 px and all three fact lines end at
740 px. At 1440 × 900, the three facts end at 709 px. Both cold loads used no
browser-storage keys, made only same-origin requests, produced no console/page
errors, and had no horizontal overflow.

The privacy fact on that otherwise clear first screen does not match sharing
behavior at its current breadth; see F-4-1.

## Findings

### Blocking

#### F-4-1 — The first-screen privacy claim does not match the sharing flow

- **Exact quote/location:** landing first-screen fact, “Data stays in this browser.”
- **Observed evidence:** the normal card workflow stores questions in the browser, but selecting **Create expiring link** sends the reviewed answer copy to `POST /api/snapshots`. The privacy page and README correctly disclose that transfer. The live request log recorded that same-origin POST only after the explicit sharing action.
- **Why this fails:** a cold visitor sees an unqualified promise about all “Data.” The listed `local-browser` claim is narrower: question cards stay in browser storage and normal reading workflows make no external-service requests. Its passing test does not prove the absolute landing sentence.
- **Concrete fix:** replace it with **“Question cards stay in this browser.”** Keep the sharing disclosure where the user chooses to create a link. The existing `local-browser` claim then matches the visible promise.

### Major

#### F-4-2 — The offline fact is broader than the tested offline result

- **Exact quotes/locations:** landing fact and README introduction, “Works after the first visit, even offline.” / “It works after the first visit, even offline.”
- **Observed evidence:** `@claim:offline-reload` proves that a visited demo reopens with saved cards and an offline notice. `@claim:offline-sharing` separately proves that creating or opening an expiring link fails offline and needs reconnection.
- **Why this matters:** “works” describes the whole product on the first screen, while a central sharing result does not work offline. The later README qualification is accurate but does not repair the broader first-screen claim.
- **Concrete fix:** use **“Saved questions reopen offline after one online visit.”** in both places. This states the tested result and leaves no hidden exception.

### Minor

#### F-4-3 — The deployment paragraph uses opaque release and security jargon

- **Exact quote/location:** `README.md`, Deployment: “The command builds `dist/` with `api/` and binds `BUILD_ID` to the exact commit before deployment. It then checks the live identity and spoof-resistant request allowance.”
- **Why this matters:** “binds,” “live identity,” and “spoof-resistant request allowance” do not name the observable checks. An operator should not have to infer what the command compares or what is being spoofed.
- **Concrete rewrite:** “The command builds `dist/` and the server functions in `api/`. It sets `BUILD_ID` to the commit being deployed. After deployment, it confirms that `/api/health` reports that commit. It also confirms that forged network-address headers cannot bypass the 100-request limit.”

#### F-4-4 — Deployment and migration guarantees are missing from `claims.json`

- **Exact quotes/location:** README Deployment: “The command builds `dist/` with `api/` and binds `BUILD_ID` to the exact commit before deployment.” “It then checks the live identity and spoof-resistant request allowance.” “The command migrates active answers and removes expired ones.”
- **Why this matters:** these are observable security and data-migration guarantees an operator can rely on. They have untagged tests in `api/tests/deploy.test.js` and `api/tests/storage.test.js`, but no entries in `.factory/claims.json`; running every manifest command therefore does not enumerate them.
- **Concrete fix:** register `deploy-integrity` and `legacy-migration` claims, tag the existing result-level tests, and use their exact commands in the manifest. The rate-limit wording may continue to use `api-rate-limit`, but the deployment command’s verification step must be named by a claim.

Routine setup facts such as the Node version, output directory, and command
names were verified as build instructions. F-4-4 concerns the stronger
security and stored-data guarantees, not every literal statement in the run
guide.

## Copy audit

Counting rule: whitespace-delimited words; hyphenated terms, URLs, paths, and
version numbers count as one word. Headings, navigation, actions, labels, alt
text, commands, and link labels are included so contextless copy is not
skipped. No unit exceeds 22 words and no supplied banned marketing term
appears. Landing buttons name their result. Flags are F-4-1 through F-4-4.

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
| 10 | 5 | Try it with sample data | Pass; result-naming action |
| 11 | 8 | Opens a filled question book in one click. | Pass |
| 12 | 5 | Data stays in this browser. | F-4-1 |
| 13 | 7 | Works after the first visit, even offline. | F-4-2 |
| 14 | 3 | Free to use. | Pass |
| 15 | 3 | No account needed. | Pass |
| 16 | 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 17 | 4 | One approved reading in. | Pass |
| 18 | 4 | One answer copy out. | Pass |
| 19 | 2 | Live preview | Pass |
| 20 | 5 | Check the latest approved readings | Pass |
| 21 | 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass |
| 22 | 3 | Approved Grafana view | Pass |
| 23 | 4 | Did Northstar orders arrive? | Pass |
| 24 | 2 | 1,842 orders | Pass |
| 25 | 2 | On track | Pass |
| 26 | 3 | 12 min ago | Pass |
| 27 | 4 | Fresh for 60 min | Pass |
| 28 | 3 | Owner Data Platform | Pass |
| 29 | 6 | Passes when at least 1,500 orders | Pass |
| 30 | 3 | Read-only Kibana link | Pass |
| 31 | 4 | Are Atlas webhooks clearing? | Pass |
| 32 | 2 | 7 queued | Pass |
| 33 | 2 | On track | Pass |
| 34 | 3 | 26 min ago | Pass |
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
| 45 | 5 | Create an expiring link. | Pass |
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
| 58 | 10 | Version 1.3.0 · Generated illustration disclosed in the design notes. | Pass |

### README

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 3 | Telemetry Question Book | Pass |
| 2 | 6 | Track recurring answers from approved readings. | Pass |
| 3 | 15 | This browser-based app is for engineering and support pairs who cannot share broad dashboard access. | Pass |
| 4 | 8 | Enter a reading or import an approved CSV. | Pass |
| 5 | 6 | The app does not query dashboards. | Pass |
| 6 | 14 | The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. | Pass |
| 7 | 8 | It works after the first visit, even offline. | F-4-2 |
| 8 | 9 | Try the isolated sample at `/demo`, `/?demo=1`, or `https://telemetry-question-book.sociobot.in/demo`. | Pass |
| 9 | 15 | Demo changes use `demo:` storage keys and never read or change the real question book. | Pass |
| 10 | 3 | What it does | Pass |
| 11 | 7 | Saves approved question cards in the browser. | Pass |
| 12 | 9 | Updates a recurring reading without making a duplicate card. | Pass |
| 13 | 9 | Imports new CSV rows and updates matching question names. | Pass |
| 14 | 9 | Marks readings as on track, needs attention, or stale. | Pass |
| 15 | 6 | Creates expiring links with random IDs. | Pass |
| 16 | 8 | Choose 1 hour, 24 hours, or 7 days. | Pass |
| 17 | 10 | Lets the creator revoke an expiring link before it expires. | Pass |
| 18 | 8 | Exports every saved question as a CSV backup. | Pass |
| 19 | 6 | Downloads dated answer copies as JSON. | Pass |
| 20 | 8 | Hides the owner, source, and note by default. | Pass |
| 21 | 10 | Accepts approved HTTPS links and never asks for dashboard credentials. | Pass |
| 22 | 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass |
| 23 | 2 | Run locally | Pass |
| 24 | 7 | Requirements: Node.js 20 or newer and npm. | Pass |
| 25 | 2 | `npm ci` | Pass; command |
| 26 | 3 | `npm run dev` | Pass; command |
| 27 | 2 | Open `http://localhost:5173`. | Pass |
| 28 | 6 | The direct demo URL is `http://localhost:5173/?demo=1`. | Pass |
| 29 | 3 | Test and build | Pass |
| 30 | 2 | `npm test` | Pass; command |
| 31 | 3 | `npm run lint` | Pass; command |
| 32 | 3 | `npm run typecheck` | Pass; command |
| 33 | 3 | `npm run build` | Pass; command |
| 34 | 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. | Pass; verified |
| 35 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass; verified |
| 36 | 14 | After one online visit, the app caches the files it needs to reopen offline. | Pass |
| 37 | 10 | Creating or opening an expiring link still needs a connection. | Pass |
| 38 | 2 | CSV format | Pass |
| 39 | 8 | Use Download CSV template for a starter file. | Pass |
| 40 | 11 | Use Export question book CSV to back up every saved card. | Pass |
| 41 | 3 | Required columns are: | Pass |
| 42 | 1 | `question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note` | Pass |
| 43 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Pass |
| 44 | 5 | `observedAt` accepts an ISO date. | Pass |
| 45 | 5 | Source URLs must use HTTPS. | Pass |
| 46 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | Pass |
| 47 | 3 | Data and sharing | Pass |
| 48 | 4 | Real questions use `tqb:v1`. | Pass |
| 49 | 4 | Demo questions use `demo:tqb:v1`. | Pass |
| 50 | 9 | The browser stores real and demo answer previews separately. | Pass |
| 51 | 6 | Preview data never enters the URL. | Pass |
| 52 | 13 | Creating an expiring link sends the reviewed copy to this site’s sharing service. | Pass |
| 53 | 9 | The link contains a random ID, not the answer. | Pass |
| 54 | 9 | The service checks expiry and revocation on every read. | Pass |
| 55 | 6 | Demo link IDs start with `d_`. | Pass |
| 56 | 8 | Reset demo and Start for real revoke them. | Pass |
| 57 | 11 | The reviewed answer is stored separately until its chosen expiry time. | Pass |
| 58 | 13 | Azure Storage removes it automatically at expiry, even when nobody opens the link. | Pass |
| 59 | 16 | The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. | Pass |
| 60 | 6 | Revocation deletes the reviewed answer immediately. | Pass |
| 61 | 8 | The sharing service groups requests by network address. | Pass |
| 62 | 12 | Each address can create, open, or revoke 100 links in 60 seconds. | Pass |
| 63 | 8 | The 101st request returns HTTP `429` with `Retry-After`. | Pass |
| 64 | 7 | Health checks do not use this limit. | Pass |
| 65 | 9 | Downloaded files do not expire or provide access control. | Pass |
| 66 | 6 | Do not put secrets in them. | Pass |
| 67 | 8 | The app has no account service or analytics. | Pass |
| 68 | 4 | See `/privacy` and `/terms`. | Pass |
| 69 | 1 | Pricing | Pass |
| 70 | 9 | This release is free and has no purchase flow. | Pass |
| 71 | 1 | Deployment | Pass |
| 72 | 6 | Deploy from a clean, committed checkout: | Pass |
| 73 | 3 | `npm run deploy` | Pass; command |
| 74 | 15 | The command builds `dist/` with `api/` and binds `BUILD_ID` to the exact commit before deployment. | F-4-3, F-4-4 |
| 75 | 10 | It then checks the live identity and spoof-resistant request allowance. | F-4-3, F-4-4 |
| 76 | 14 | The deployed app needs a secret `SnapshotStorage` setting for its approved Azure Storage account. | Pass; operator requirement |
| 77 | 8 | The connection needs Table and Queue service access. | Pass; operator requirement |
| 78 | 4 | Never commit its value. | Pass |
| 79 | 14 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. | Pass; conditional command |
| 80 | 9 | The command migrates active answers and removes expired ones. | F-4-4 |
| 81 | 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. | Pass; verified structure |
| 82 | 8 | Azure Static Web Apps reads it during deployment. | Pass; platform instruction |
| 83 | 2 | Project notes | Pass |
| 84 | 2 | Visual system | Pass; link label |
| 85 | 2 | Verified claims | Pass; link label |
| 86 | 2 | Demo contract | Pass; link label |
| 87 | 2 | Build handoff | Pass; link label |
| 88 | 2 | MIT licensed. | Pass |
| 89 | 2 | See LICENSE. | Pass |

## Demo, sandbox, privacy, and offline

- One click from `/` opened `/demo` with three named samples and the sticky “Demo — sample data, nothing is saved” banner.
- At 390 × 844, the first card’s question, `1,842` value, “On track” state, and “Fresh for 60 min” text ended at 630, 670, 719, and 763 px.
- Changing the stored demo value to `9,999`, then choosing **Reset demo**, restored `1,842`.
- Pre-seeded real question, preview, and share sentinels remained byte-for-byte unchanged through reset, preview creation, sharing, and **Start for real**.
- The demo preview used `demo:tqb:snapshot-preview` and kept the banner on `/demo/snapshot`. Its created link used a `d_` ID, returned 200, and returned 410 after leaving demo. Every `demo:` key was removed.
- The full live flow requested only `https://telemetry-question-book.sociobot.in`. Static reading changes made no analytics, account, dashboard, model, font-CDN, or third-party request. The snapshot POST/DELETE occurred only after explicit sharing actions.
- After the service worker controlled the page, live `/demo` reloaded offline with all three cards and the visible offline notice.

## Claim execution

The untouched base was cloned to a new temporary directory. After `npm ci`,
every exact `test` command from `.factory/claims.json` ran independently. Each
claim ID occurs exactly once in test titles.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `card-fields` | PASS |
| `local-browser` | PASS; public wording mismatch is F-4-1 |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS; public wording mismatch is F-4-2 |
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
| `share-expiry-options` | PASS |
| `share-redaction` | PASS |
| `share-revocation` | PASS |
| `least-privilege-input` | PASS |
| `sample-sources` | PASS |
| `snapshot-retention` | PASS |
| `snapshot-storage-minimization` | PASS |
| `api-rate-limit` | PASS |
| `health-rate-limit` | PASS |

No listed command failed. F-4-1 and F-4-2 are copy-to-claim scope
mismatches; F-4-4 is an inventory omission.

## Earlier-finding audit

Every finding in reviews 1–3 and every closure in polish reports 1–3 was
checked in current code and independently on the live site. The polish reports
were not accepted as proof.

| Earlier ID | Current verification | Status |
| --- | --- | --- |
| F-1-1 | First demo question/value/state/freshness end at 630/670/719/763 px on 390 × 844. | Fixed |
| F-1-2 | Demo question, preview, and share keys are separate; banner persists; reset/leave preserve real sentinels. | Fixed |
| F-1-3 | A server-held `d_` link opens, expires/revokes, and returns 410 after demo exit. | Fixed |
| F-1-4 | Job-first headline and manual entry/import boundary are in the first screen. | Fixed |
| F-1-5 | The tagged reload test checks owner, freshness, threshold, source name, and exact source URL. | Fixed |
| F-1-6 | Tagged tests complete validation, free workflows, HTTPS save, and all sharing handlers. | Fixed |
| F-1-7 | All three sample sources have distinct live titles. | Fixed |
| F-1-8 | `/snapshot` and `/demo/snapshot` remain in the sitemap and are `noindex`. | Fixed |
| F-1-9 | Unknown URLs return the full designed HTTP 404 shell and metadata. | Fixed |
| F-1-10 | “Governed” is absent; copy uses “approved.” | Fixed |
| F-1-11 | “Support-ready” is absent; copy uses “answer copy.” | Fixed |
| F-1-12 | Preview heading is “Check the latest approved readings.” | Fixed |
| F-1-13 | Dated-copy copy names the hidden fields; prior jargon is absent. | Fixed |
| F-1-14 | “Question book” remains the collection term. | Fixed |
| F-1-15 | Process label is “Three steps to keep answers current.” | Fixed |
| F-1-16 | Boundary label is “What the question book does not do.” | Fixed |
| F-1-17 | README explains browser storage without “local-first.” | Fixed |
| F-1-18 | README names the offline result rather than service-worker jargon. | Fixed; new scope issue is F-4-2 |
| F-1-19 | Deployment structure is explained in operator terms apart from new F-4-3. | Fixed |
| F-2-1 | `csv-schema` registers and tests comparisons plus valid/invalid dates. | Fixed |
| F-2-2 | `offline-sharing` tests create/open errors and reconnection. | Fixed |
| F-2-3 | `demo-controls` names and tests `d_` IDs plus reset/leave revocation. | Fixed |
| F-2-4 | Metadata keys and immediate stored-answer deletion are tested. | Fixed |
| F-2-5 | Health-limit exemption is registered and tested. | Fixed |
| F-2-6 | Whole-book CSV export is workspace-isolated and round-trips without duplicates. | Fixed |
| F-2-7 | All desktop facts end by 709 px in the 900 px viewport. | Fixed |
| F-2-8 | Focused skip link sits below the header and does not cover Demo. | Fixed |
| F-2-9 | “Opaque answer links” is absent. | Fixed |
| F-2-10 | “First-party snapshot API” is absent from workflow copy. | Fixed |
| F-2-11 | Public copy says “random ID,” not “opaque token.” | Fixed |
| F-2-12 | User-facing data-sharing copy avoids queue/table/TTL jargon. | Fixed |
| F-2-13 | Candidate-specific migration history is absent. | Fixed |
| F-3-1 | All three expiry choices have one registered result-level test. | Fixed |
| F-3-2 | Public output consistently uses “expiring link.” | Fixed |
| F-3-3 | Browser separation is described without session-storage jargon. | Fixed |
| F-3-4 | Public limit copy names sharing, network address, and request 101. | Fixed |
| F-3-5 | “Managed functions” is absent; README says server functions where needed. | Fixed |
| F-3-6 | “First-party” is absent from deployment copy. | Fixed |
| F-3-7 | “Parity checks” is absent; the new replacement still needs F-4-3/F-4-4. | Fixed |

The later independent-verification failures were also rechecked: rotated
caller headers cannot split the rate allowance; the live API reports the
deployed candidate build; and forward/reverse Tab remains inside the
answer-copy dialog with visible focus. None regressed.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, `/demo/snapshot`, and all three source routes returned 200. The unknown route returned the designed 404.
- Each audited route has `lang="en"`, one h1, one main, one header/footer, route-specific title and description, canonical, Open Graph/Twitter image metadata, SVG favicon, 180 px Apple icon, and no missing image alt.
- In-app navigation to Demo focused and announced its h1. Back returned to `/`, scroll 0, focused and announced the landing h1. The focused skip link has a 3 px visible outline and does not overlap navigation.
- Every product link returned 200; the deliberate unknown route returned 404; the two contact links are explicit `mailto:` links. The external Sociobot/Param Factory link returned 200.
- Eleven live route scans and the full local desktop/mobile matrix found zero serious or critical Axe violations. The factory URL verifier passed root and `/demo` with no console/page errors.
- The mid-century instrument panel, cream/forest/amber palette, narrow display type, monospaced readings, paper cards, original console artwork, and disconnected-console 404 match `.factory/design.md` and are not a generic SaaS template.
- The live and clean-build HTML, JavaScript, CSS, and service worker match byte-for-byte. JavaScript is 36,513 bytes raw / 11.91 kB gzip; CSS is 17,033 bytes raw / 4.84 kB gzip.

## Repository verification

From the clean clone at `f89c364a1660e73d560637213cbc2737f5fdf684`:

- 26/26 exact claim commands: PASS.
- `npm test`: PASS — 15 API tests and 31 Playwright tests.
- `npm run lint`, `npm run typecheck`, and `npm run build`: PASS; `dist/index.html` produced.
- Root full and production dependency audits: PASS; zero vulnerabilities.
- `git diff --check`: PASS.

## Missed leverage

No AI feature is justified. The brief explicitly says not to generate
explanations with an LLM, and the client contains no model key or provider
request. CSV import/export, JSON download, and expiring/revocable sharing cover
the obvious portability and handoff needs. Cloud sync would change the stated
browser-storage boundary rather than complete an implied job.

## What would make this perfect

Narrow the privacy and offline facts to their tested results, rewrite the
deployment paragraph in observable terms, and register the deployment and
migration guarantees. Then rerun every claim and the complete cold-copy,
demo-isolation, request-log, routing, accessibility, and history audit. Until
that produces zero findings, the required verdict remains FAIL.
