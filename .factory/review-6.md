# Adversarial first-read review 6 — Telemetry Question Book

**Verdict: FAIL.** Reviewed 29 August 2026 UTC against
<https://telemetry-question-book.sociobot.in> in fresh Chromium 1.58.2
contexts at 390 × 844 and 1440 × 900. Product code was not modified. One
reopened blocking finding remains: several registered claims are still broader
than their tagged assertions. All 28 listed commands pass, but those passes do
not cover every promised result.

## Cold first read

Before scrolling, my answers were:

- **What does this do?** It tracks recurring answers from readings a person
  enters or imports.
- **For whom?** Support teams that do not have broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This gate passes on phone and desktop. The exact first-screen text was “Track
recurring answers from approved readings,” “For support teams: enter a reading
or approved CSV. The app does not query dashboards,” and “Try it with sample
data,” followed by “Opens a filled question book in one click.”

At 390 px, the action ended at y=577 and the privacy, offline, and price facts
ended at y=716, 774, and 807. At 1440 px, the action ended at y=604 and the facts
ended at y=650, 683, and 716. Cold loads created no local- or session-storage
keys, made only same-origin requests, produced no console/page error, and had no
horizontal overflow.

## Finding

### Blocking

#### F-1-6 — Reopened: registered claims remain broader than their tagged assertions

- **Earlier finding:** Review 1 F-1-6 and review 2’s blocking recurrence required
  each claim’s one tagged test to prove the complete observable promise.
- **Exact claim/location:** `.factory/claims.json:3`, `demo-controls`: “Reset demo
  and Start for real revoke them and clear every demo key without changing real
  data.” In `tests/claims.spec.ts:83-100`, **Reset demo** runs before any link is
  created. The test creates a link only afterward and proves revocation/cleanup
  only through **Start for real**. It never proves that Reset revokes a link, and
  it never checks that Reset removed the pre-seeded `demo:extra` key.
- **Exact claim/location:** `.factory/claims.json:12`, `csv-validation`, says the
  form and CSV accept the complete 1–10,080 range. The tagged test proves CSV
  values 0, 1, 1.5, and 10,081, but never successfully imports 10,080 in that
  tagged test. The form branch does test 10,080. A different claim test happens
  to import the value, which does not complete this claim’s required sandbox.
- **Exact claim/location:** `.factory/claims.json:14`, `csv-template`, requires
  exact headers. `tests/claims.spec.ts:317` uses `toContain`, so an extra or
  prefixed column would pass. The test counts a second row but does not inspect
  the sample row.
- **Exact claim/location:** `.factory/claims.json:16`, `answer-copy-security`,
  promises separate real and demo preview storage. Its tagged test reads the
  demo key but does not pre-seed and compare the real preview key, so writing
  both keys would pass this test.
- **Exact claim/location:** `.factory/claims.json:17`, `answer-copy-download`,
  promises the reviewed answer. `tests/claims.spec.ts:383-384` checks the
  question, version, redaction flag, and omitted private fields, but not the
  answer, status, or observed/created timestamps. A JSON file that omitted the
  actual answer would pass.
- **Why this blocks:** The commands are green, but the manifest is the verifier’s
  contract. These missing assertions leave public privacy, reset, boundary,
  schema, and export promises untested. Review 2 already classified this exact
  claim-to-test mismatch as blocking; later polish reports marked it fixed
  without covering these branches.
- **Concrete fix:** Extend `@claim:demo-controls` with a created link followed by
  Reset, HTTP 410, removal of all old `demo:` keys, re-seeding only the sample
  question key, and unchanged real sentinels; then repeat for Start. Add a
  successful 10,080 CSV import to `@claim:csv-validation`. Compare the template
  header with exact equality and inspect the sample row. Seed a real preview in
  `@claim:answer-copy-security` and prove it is unchanged. In
  `@claim:answer-copy-download`, compare the exact included key set and the
  answer/status/timestamps with the reviewed preview.

No new F-6 identifier is assigned because the history rule requires this
half-fixed finding to retain its original ID.

## Copy audit

Counting uses whitespace-delimited words; URLs, identifiers, and hyphenated
terms count as one word. Every landing and README sentence is at or below 22
words. No supplied banned word, unclear heading, metaphor heading, inconsistent
product term, or non-result-naming landing action was found.

### Landing page

| Words | Exact reader-facing copy | Result |
| ---: | --- | --- |
| 4 | Skip to main content | Pass |
| 3 | Telemetry Question Book | Pass |
| 1 | Demo | Pass |
| 3 | My question book | Pass |
| 1 | Privacy | Pass |
| 5 | Approved readings · plain answers | Pass |
| 6 | Track recurring answers from approved readings | Pass; h1 names the job |
| 9 | For support teams: enter a reading or approved CSV. | Pass |
| 6 | The app does not query dashboards. | Pass |
| 5 | Try it with sample data | Pass; result-naming action |
| 8 | Opens a filled question book in one click. | Pass |
| 6 | Question cards stay in this browser. | Pass |
| 8 | Saved questions reopen offline after one online visit. | Pass |
| 3 | Free to use. | Pass |
| 3 | No account needed. | Pass |
| 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 4 | One approved reading in. | Pass |
| 4 | One answer copy out. | Pass |
| 2 | Live preview | Pass |
| 5 | Check the latest approved readings | Pass |
| 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass |
| 3 | Approved Grafana view | Pass |
| 4 | Did Northstar orders arrive? | Pass |
| 2 | 1,842 orders | Pass |
| 2 | On track | Pass |
| 3 | 12 min ago | Pass |
| 4 | Fresh for 60 min | Pass |
| 3 | Owner Data Platform | Pass |
| 6 | Passes when at least 1,500 orders | Pass |
| 3 | Read-only Kibana link | Pass |
| 4 | Are Atlas webhooks clearing? | Pass |
| 2 | 7 queued | Pass |
| 2 | On track | Pass |
| 3 | 26 min ago | Pass |
| 4 | Fresh for 45 min | Pass |
| 2 | Owner Reliability | Pass |
| 6 | Passes when at most 10 queued | Pass |
| 6 | Three steps to keep answers current | Pass |
| 5 | How the question book works | Pass |
| 3 | Name the question | Pass |
| 8 | Write the customer question and assign its owner. | Pass |
| 4 | Add an approved reading | Pass |
| 10 | Paste a read-only link or import an approved CSV export. | Pass |
| 3 | Share the answer | Pass |
| 4 | Create an expiring link. | Pass |
| 9 | Choose whether to hide the owner, source, and note. | Pass |
| 7 | What the question book does not do | Pass; descriptive h2 |
| 7 | It does not ingest logs or metrics. | Pass |
| 6 | It does not write query language. | Pass |
| 7 | It does not alert or monitor systems. | Pass |
| 6 | It never asks for dashboard credentials. | Pass |
| 6 | Plain answers from approved telemetry readings. | Pass |
| 1 | Privacy | Pass |
| 1 | Terms | Pass |
| 6 | Built by Param Factory (external site) | Pass |
| 10 | Version 1.3.0 · Generated illustration disclosed in the design notes. | Pass |

### README sentences

| # | Words | Exact sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 6 | Track recurring answers from approved readings. | Pass |
| 2 | 15 | This browser-based app is for engineering and support pairs who cannot share broad dashboard access. | Pass |
| 3 | 8 | Enter a reading or import an approved CSV. | Pass |
| 4 | 6 | The app does not query dashboards. | Pass |
| 5 | 14 | The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. | Pass |
| 6 | 8 | Saved questions reopen offline after one online visit. | Pass |
| 7 | 9 | Try the isolated sample at `/demo`, `/?demo=1`, or `https://telemetry-question-book.sociobot.in/demo`. | Pass |
| 8 | 15 | Demo changes use `demo:` storage keys and never read or change the real question book. | Pass |
| 9 | 7 | Saves approved question cards in the browser. | Pass |
| 10 | 9 | Updates a recurring reading without making a duplicate card. | Pass |
| 11 | 9 | Imports new CSV rows and updates matching question names. | Pass |
| 12 | 9 | Marks readings as on track, needs attention, or stale. | Pass |
| 13 | 6 | Creates expiring links with random IDs. | Pass |
| 14 | 8 | Choose 1 hour, 24 hours, or 7 days. | Pass |
| 15 | 10 | Lets the creator revoke an expiring link before it expires. | Pass |
| 16 | 8 | Exports every saved question as a CSV backup. | Pass |
| 17 | 6 | Downloads dated answer copies as JSON. | Pass |
| 18 | 8 | Hides the owner, source, and note by default. | Pass |
| 19 | 10 | Accepts approved HTTPS links and never asks for dashboard credentials. | Pass |
| 20 | 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass |
| 21 | 7 | Requirements: Node.js 20 or newer and npm. | Pass |
| 22 | 2 | Open `http://localhost:5173`. | Pass |
| 23 | 6 | The direct demo URL is `http://localhost:5173/?demo=1`. | Pass |
| 24 | 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. | Pass |
| 25 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass |
| 26 | 14 | After one online visit, the app caches the files it needs to reopen offline. | Pass |
| 27 | 10 | Creating or opening an expiring link still needs a connection. | Pass |
| 28 | 8 | Use Download CSV template for a starter file. | Pass |
| 29 | 11 | Use Export question book CSV to back up every saved card. | Pass |
| 30 | 3 | Required columns are: | Pass |
| 31 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Pass |
| 32 | 5 | `observedAt` accepts an ISO date. | Pass |
| 33 | 5 | Source URLs must use HTTPS. | Pass |
| 34 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | Pass |
| 35 | 4 | Real questions use `tqb:v1`. | Pass |
| 36 | 4 | Demo questions use `demo:tqb:v1`. | Pass |
| 37 | 9 | The browser stores real and demo answer previews separately. | Pass; test gap in F-1-6 |
| 38 | 6 | Preview data never enters the URL. | Pass |
| 39 | 13 | Creating an expiring link sends the reviewed copy to this site’s sharing service. | Pass |
| 40 | 9 | The link contains a random ID, not the answer. | Pass |
| 41 | 9 | The service checks expiry and revocation on every read. | Pass |
| 42 | 6 | Demo link IDs start with `d_`. | Pass |
| 43 | 8 | Reset demo and Start for real revoke them. | Test gap in F-1-6 |
| 44 | 11 | The reviewed answer is stored separately until its chosen expiry time. | Pass |
| 45 | 13 | Azure Storage removes it automatically at expiry, even when nobody opens the link. | Pass |
| 46 | 16 | The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. | Pass |
| 47 | 6 | Revocation deletes the reviewed answer immediately. | Pass |
| 48 | 8 | The sharing service groups requests by network address. | Pass |
| 49 | 12 | Each address can create, open, or revoke 100 links in 60 seconds. | Pass |
| 50 | 8 | The 101st request returns HTTP `429` with `Retry-After`. | Pass |
| 51 | 7 | Health checks do not use this limit. | Pass |
| 52 | 9 | Downloaded files do not expire or provide access control. | Pass |
| 53 | 6 | Do not put secrets in them. | Pass |
| 54 | 8 | The app has no account service or analytics. | Pass |
| 55 | 4 | See `/privacy` and `/terms`. | Pass |
| 56 | 9 | This release is free and has no purchase flow. | Pass |
| 57 | 6 | Deploy from a clean, committed checkout: | Pass |
| 58 | 10 | The command builds `dist/` and the server functions in `api/`. | Pass |
| 59 | 10 | It stamps `dist/build-info.json` and sets `BUILD_ID` to the same commit. | Pass |
| 60 | 14 | After deployment, it confirms that both the static marker and `/api/health` report that commit. | Pass |
| 61 | 12 | It also confirms that forged network-address headers cannot bypass the 100-request limit. | Pass |
| 62 | 14 | The deployed app needs a secret `SnapshotStorage` setting for its approved Azure Storage account. | Pass |
| 63 | 8 | The connection needs Table and Queue service access. | Pass |
| 64 | 4 | Never commit its value. | Pass |
| 65 | 14 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. | Pass |
| 66 | 9 | The command migrates active answers and removes expired ones. | Pass |
| 67 | 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. | Pass |
| 68 | 8 | Azure Static Web Apps reads it during deployment. | Pass |
| 69 | 2 | MIT licensed. | Pass |
| 70 | 2 | See LICENSE. | Pass |

README headings and non-sentence copy also pass: **Telemetry Question Book**
(3), **What it does** (3), **Run locally** (2), **Test and build** (3), **CSV
format** (2), **Data and sharing** (3), **Pricing** (1), **Deployment** (1), and
**Project notes** (2). Commands are `npm ci` (2), `npm run dev` (3), `npm test`
(2), `npm run lint` (3), `npm run typecheck` (3), `npm run build` (3), and `npm
run deploy` (3). The schema line counts as one token. The four project-note
links each have two-word, descriptive labels.

The terminology is consistent: **question**, **question book**, **reading**,
**answer copy**, **expiring link**, **freshness limit**, **threshold**,
**approved source**, and **demo** each name one concept.

## Demo, sandbox, privacy, and offline

- One click from `/` opened `/demo` with three named readings and the persistent
  “Demo — sample data, nothing is saved” banner.
- At 390 × 844, the first sample question, value, state, and freshness ended at
  y=641, 681, 737, and 792. At 1440 × 900 they ended at y=848, 888, 830, and
  885. Each required detail intersected the initial viewport.
- Updating Northstar to 9,999 and selecting **Reset demo** restored 1,842.
  Real question, preview, and share sentinels remained byte-for-byte unchanged.
- A demo answer preview used `demo:tqb:snapshot-preview`; the banner remained on
  `/demo/snapshot`; its link used a `d_` ID. **Start for real** removed all
  `demo:` keys, preserved all real sentinels, and changed the link from 200 to
  410. Source inspection confirms Reset calls the same cleanup function, but
  F-1-6 records that the tagged test does not prove that branch.
- Live normal reading, reset, preview, sharing, and offline flows contacted only
  `https://telemetry-question-book.sociobot.in`. The snapshot POST/DELETE
  occurred only after the explicit sharing action. No analytics, model,
  dashboard, account, external-font, or third-party origin appeared.
- After service-worker control, the live demo reloaded offline with three cards
  and “You are offline. Saved questions are still available.”

## Claims execution

The untouched checkout was cloned to
`/tmp/tqb-review6-clean-RhdiHp/repo`. After `npm ci`, every literal `test`
command in `.factory/claims.json` ran independently. Every claim ID occurs once
in test titles.

| Claim | Exact command result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS; incomplete Reset branch, F-1-6 |
| `card-fields` | PASS |
| `local-browser` | PASS |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `offline-sharing` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS; missing tagged CSV 10,080 acceptance, F-1-6 |
| `csv-schema` | PASS |
| `csv-template` | PASS; assertion is not exact, F-1-6 |
| `question-book-export` | PASS |
| `answer-copy-security` | PASS; real-preview separation is not asserted in this test, F-1-6 |
| `answer-copy-download` | PASS; downloaded answer fields are not asserted, F-1-6 |
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
| `deploy-integrity` | PASS |
| `legacy-migration` | PASS |

No landing or README behavior sentence lacks a manifest entry. F-1-6 concerns
the depth of the listed tests, not missing entries or command failures.

## Earlier-finding audit

Every review, polish report, and the current handoff was read. Each earlier
finding was checked in both the live product and current code/tests; closure
statements were not accepted as proof.

| Earlier ID | Current independent check | Status |
| --- | --- | --- |
| F-1-1 | Phone demo shows question, value, state, and freshness before the fold. | Fixed |
| F-1-2 | Demo question/preview/share namespaces are separate; banner persists; real sentinels survive. | Fixed |
| F-1-3 | Server-held links expire, redact, reject changed IDs, and revoke to 410. | Fixed |
| F-1-4 | Job-first headline plus manual entry/CSV and no-query boundary appear above the fold. | Fixed |
| F-1-5 | Owner, freshness, threshold, source name, and source URL are asserted before and after reload. | Fixed |
| F-1-6 | Several current claim assertions omit promised branches or output fields. | **Regressed/half-fixed; BLOCKING** |
| F-1-7 | The three sample routes have distinct live titles. | Fixed |
| F-1-8 | `/snapshot` and `/demo/snapshot` remain in the sitemap and are noindex. | Fixed |
| F-1-9 | The HTTP 404 has the full header/footer, metadata, icons, and product treatment. | Fixed |
| F-1-10 | “Governed” is absent; “approved” is used. | Fixed |
| F-1-11 | “Support-ready” is absent; “answer copy” is used. | Fixed |
| F-1-12 | Preview h2 is “Check the latest approved readings.” | Fixed |
| F-1-13 | Dated-copy text names the hidden fields without prior jargon. | Fixed |
| F-1-14 | “Question book” is the consistent collection term. | Fixed |
| F-1-15 | Process label is “Three steps to keep answers current.” | Fixed |
| F-1-16 | The actual h2 is “What the question book does not do.” | Fixed |
| F-1-17 | README explains browser storage without “local-first.” | Fixed |
| F-1-18 | README names the offline result without service-worker jargon. | Fixed |
| F-1-19 | README explains routing, 404, caching, and protections in operator terms. | Fixed |
| F-2-1 | CSV comparisons and ISO dates have a registered tagged test. | Fixed |
| F-2-2 | Offline create/open errors and reconnect recovery are registered and tested. | Fixed |
| F-2-3 | Claim wording names `d_` IDs and both exits; live behavior works. Coverage remains under F-1-6. | Fixed |
| F-2-4 | Exact metadata keys and immediate answer deletion are asserted. | Fixed |
| F-2-5 | Health remains available and read-only across 200 calls. | Fixed |
| F-2-6 | Whole-book CSV export is demo-isolated and duplicate-free on round trip. | Fixed |
| F-2-7 | All three facts fit both initial viewports. | Fixed |
| F-2-8 | Focused skip link sits below the header and does not cover Demo. | Fixed |
| F-2-9 | Public copy says “random IDs,” not “opaque.” | Fixed |
| F-2-10 | Public copy says “this site’s sharing service.” | Fixed |
| F-2-11 | Public copy says “random ID, not the answer.” | Fixed |
| F-2-12 | User-facing sharing copy avoids queue/table/TTL jargon. | Fixed |
| F-2-13 | Candidate-specific migration history is absent. | Fixed |
| F-3-1 | All three expiry values are registered and measured within five seconds. | Fixed |
| F-3-2 | “Expiring link” is the consistent public term. | Fixed |
| F-3-3 | Preview separation is described without session-storage jargon. | Fixed |
| F-3-4 | Limit copy names sharing, network address, request 101, 429, and `Retry-After`. | Fixed |
| F-3-5 | Deployment copy says “server functions.” | Fixed |
| F-3-6 | “First-party” is absent from deployment copy. | Fixed |
| F-3-7 | Deployment copy names the build-ID comparison directly. | Fixed |
| F-4-1 | First-screen privacy fact is narrowed to question cards. | Fixed |
| F-4-2 | Offline fact is narrowed to saved-question reopening. | Fixed |
| F-4-3 | Deployment paragraph names build, commit, health comparison, and forged-header check. | Fixed |
| F-4-4 | Deployment integrity and migration are registered and tagged. | Fixed |
| F-5-1 | Limits section uses the concrete h2 “What the question book does not do.” | Fixed |

Review 1 also carried forward pre-ID verification findings. They were checked
again because later polish reports and handoffs cited them:

| Earlier finding | Current independent check | Status |
| --- | --- | --- |
| Snapshot expiry and integrity were client-side only | Server-held random-ID links now enforce expiry and revocation; payloads stay out of URLs. | Fixed |
| Recurring readings could not update | Updating Northstar retains three cards and survives reload. | Fixed |
| An unavailable paid checkout was advertised | No paid offer, checkout, purchase control, or payment request exists. | Fixed by removal |
| Claim manifest was incomplete | All public behavior sentences are listed, but assertion depth remains blocking F-1-6. | Partly fixed; F-1-6 |
| Demo source links were dead | All three same-origin sample sources return 200 with distinct titles. | Fixed |
| CSV could bypass form validation | Shared validation rejects malformed fields, URLs, numbers, comparisons, and dates. | Functionally fixed; test-depth issue remains in F-1-6 |
| Touch targets were below 44 px | Mobile target regression and live route checks pass. | Fixed |
| Focus ring contrast was too low | Live keyboard focus uses the designed 3 px inner/outer ring; dialog focus remains contained. | Fixed |
| 404 inline style violated CSP | Styles are external and the response CSP produces no violation. | Fixed |
| Vite had a high-severity advisory | Vite is 7.3.6 and both dependency audits report zero vulnerabilities. | Fixed |
| Unknown routes returned 200 | Unknown paths return the designed document with HTTP 404. | Fixed |
| Non-hashed art was cached as immutable | Art uses daily revalidation; only hashed build assets are immutable. | Fixed |
| Comparison text repeated “at” | Cards say “Passes when at least/at most.” | Fixed |
| Demo count was hard-coded | The count follows the current question array. | Fixed |
| Caller-supplied forwarding headers could split the limit | The integrated rate-limit test rotates spoofed headers and still blocks combined request 101. | Fixed |
| Static and API deployment identities could diverge | Live `/build-info.json` and `/api/health` report the same 40-character build. | Fixed |
| Answer-copy dialog focus could escape | Full-suite forward/reverse Tab regressions pass with visible focus. | Fixed |
| Paper texture reduced primary-button contrast | `--switch-ink` remains black; live Axe scans report no serious/critical contrast issue. | Fixed |

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, `/demo/snapshot`,
  and all three sample sources return 200. An unknown route returns the designed
  instrument-panel document with HTTP 404.
- Both viewports have `lang=en`, one h1, one main, a consistent header/footer,
  route-specific title and description, canonical, Open Graph/Twitter image,
  SVG favicon, 180 px Apple icon, no missing alt, and no horizontal overflow.
  The social image is 1200 × 630.
- In-app Demo navigation focuses and announces its h1. Back returns to `/`,
  scrolls to 0, and focuses the landing h1. The focused skip link is visible
  below the header with a 3 px outline.
- All crawled product and external HTTP links return 200. `mailto:` links are
  explicit. The 404 document’s same-document skip link correctly remains on
  the 404 response.
- Twenty-two live Axe scans across eleven routes at both viewports found zero
  serious or critical violations. The factory URL verifier passed `/` and
  `/demo` with no normal-load errors.
- The cream, forest, amber, hard-edged instrument panel, paper-card layout,
  original console art, and disconnected-console 404 match `.factory/design.md`
  and are visually distinct from a generic SaaS template.
- The clean build outputs 36.46 kB JavaScript raw / 11.89 kB gzip and 17.19 kB
  CSS raw / 4.88 kB gzip. Its hashed JavaScript and CSS match the live files
  byte-for-byte. No third-party font or script is loaded.

## Repository verification

From the clean clone:

- 28/28 literal claim commands: PASS, with the assertion-depth defects in
  F-1-6.
- `npm test`: PASS — 15 API tests and 33 Playwright tests.
- `npm run lint`, `npm run typecheck`, and `npm run build`: PASS;
  `dist/index.html` exists.
- Full and production high-severity dependency audits: PASS, zero
  vulnerabilities.
- `git diff --check`: PASS.

The deployed static marker and `/api/health` both report
`566300dfe913e1feb162af3deae250721034cbdd` with snapshot storage available.

## Missed leverage

No AI feature is justified. The brief explicitly says not to generate
explanations with an LLM, and no provider key or model request exists in the
client. CSV import/export, JSON download, and revocable expiring links cover
the obvious portability and support-handoff needs. Sync would change the stated
browser-storage boundary rather than complete an implied job.

## What would make this perfect

Close F-1-6 by making each tagged claim test prove its complete sandbox
contract, then rerun every literal command and this full live review. No product
copy, layout, workflow, accessibility, routing, privacy behavior, or missing
feature change is otherwise indicated by this round.
