# Adversarial first-read review 8 — Telemetry Question Book

**Verdict: PASS.** Reviewed 30 August 2026 UTC against
<https://telemetry-question-book.sociobot.in> in fresh Chromium 1.58.2
contexts at 390 × 844 and 1440 × 900. Product code was not modified. There are
zero blocking, major, or minor findings, and no untested claim remains.

## Cold first read

Before scrolling, my answers were:

- **What does this do?** It records recurring telemetry answers from readings a
  person enters or imports.
- **For whom?** Support teams that cannot have broad dashboard access.
- **What should I click first?** **Try it with sample data**.

The gate passes at both viewport sizes. The exact first-screen copy that
supplied the answers was “Track recurring answers from approved readings,”
“For support teams: enter a reading or approved CSV. The app does not query
dashboards,” and “Try it with sample data.” The adjacent result text says
“Opens a filled question book in one click.” The privacy, offline, and price
facts were also visible without scrolling; on the 390 × 844 screen the final
fact ended at y=807 px. Cold loads created no storage, used only the product
origin, had no console or page error, and did not overflow horizontally.

## Findings

None.

## Copy audit

Counts are whitespace-delimited; hyphenated terms, identifiers, URLs, and paths
count as one word. Sentence fragments, headings, navigation, actions, labels,
alt text, and commands were also checked so unclear non-sentence copy was not
missed. No copy unit exceeds 22 words. No banned marketing adjective,
unexplained jargon, metaphor or mood heading, inconsistent product term, or
non-result-naming action remains.

### Landing page

| Words | Exact reader-facing copy | Result |
| ---: | --- | --- |
| 4 | Skip to main content | Pass |
| 3 | Telemetry Question Book | Pass |
| 1 | Demo | Pass |
| 3 | My question book | Pass; desktop navigation |
| 1 | Questions | Pass; compact mobile navigation for the same destination |
| 1 | Privacy | Pass |
| 5 | Approved readings · plain answers | Pass; names input and output |
| 6 | Track recurring answers from approved readings | Pass; job-first h1 |
| 9 | For support teams: enter a reading or approved CSV. | Pass |
| 6 | The app does not query dashboards. | Pass |
| 5 | Try it with sample data | Pass; result-naming primary action |
| 8 | Opens a filled question book in one click. | Pass |
| 6 | Question cards stay in this browser. | Pass; `local-browser` |
| 8 | Saved questions reopen offline after one online visit. | Pass; `offline-reload` |
| 3 | Free to use. | Pass; `free-core` |
| 3 | No account needed. | Pass; `free-core` |
| 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 4 | One approved reading in. | Pass |
| 4 | One answer copy out. | Pass |
| 2 | Live preview | Pass |
| 5 | Check the latest approved readings | Pass; descriptive h2 |
| 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass; `card-fields` |
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
| 5 | How the question book works | Pass; descriptive h2 |
| 3 | Name the question | Pass |
| 8 | Write the customer question and assign its owner. | Pass |
| 4 | Add an approved reading | Pass |
| 10 | Paste a read-only link or import an approved CSV export. | Pass |
| 3 | Share the answer | Pass |
| 4 | Create an expiring link. | Pass; `expiring-share` |
| 9 | Choose whether to hide the owner, source, and note. | Pass; `share-redaction` |
| 7 | What the question book does not do | Pass; descriptive h2 |
| 7 | It does not ingest logs or metrics. | Pass; `local-browser` |
| 6 | It does not write query language. | Pass; `local-browser` |
| 7 | It does not alert or monitor systems. | Pass; `local-browser` |
| 6 | It never asks for dashboard credentials. | Pass; `least-privilege-input` |
| 6 | Plain answers from approved telemetry readings. | Pass |
| 1 | Privacy | Pass |
| 1 | Terms | Pass |
| 6 | Built by Param Factory (external site) | Pass |
| 10 | Version 1.3.0 · Generated illustration disclosed in the design notes. | Pass |

### README

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
| 24 | 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. | Pass; verified |
| 25 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass; verified |
| 26 | 14 | After one online visit, the app caches the files it needs to reopen offline. | Pass |
| 27 | 10 | Creating or opening an expiring link still needs a connection. | Pass |
| 28 | 8 | Use **Download CSV template** for a starter file. | Pass |
| 29 | 11 | Use **Export question book CSV** to back up every saved card. | Pass |
| 30 | 3 | Required columns are: | Pass |
| 31 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Pass |
| 32 | 5 | `observedAt` accepts an ISO date. | Pass |
| 33 | 5 | Source URLs must use HTTPS. | Pass |
| 34 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | Pass |
| 35 | 4 | Real questions use `tqb:v1`. | Pass |
| 36 | 4 | Demo questions use `demo:tqb:v1`. | Pass |
| 37 | 9 | The browser stores real and demo answer previews separately. | Pass |
| 38 | 6 | Preview data never enters the URL. | Pass |
| 39 | 13 | Creating an expiring link sends the reviewed copy to this site’s sharing service. | Pass |
| 40 | 9 | The link contains a random ID, not the answer. | Pass |
| 41 | 9 | The service checks expiry and revocation on every read. | Pass |
| 42 | 6 | Demo link IDs start with `d_`. | Pass |
| 43 | 8 | **Reset demo** and **Start for real** revoke them. | Pass |
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
| 63 | 8 | The connection needs Table and Queue service access. | Pass; exact operator vocabulary |
| 64 | 4 | Never commit its value. | Pass |
| 65 | 14 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. | Pass |
| 66 | 9 | The command migrates active answers and removes expired ones. | Pass |
| 67 | 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. | Pass |
| 68 | 8 | Azure Static Web Apps reads it during deployment. | Pass |
| 69 | 2 | MIT licensed. | Pass |
| 70 | 2 | See [LICENSE](LICENSE). | Pass |

README headings and non-sentence copy also pass: **Telemetry Question Book**
(3), **What it does** (3), **Run locally** (2), **Test and build** (3), **CSV
format** (2), **Data and sharing** (3), **Pricing** (1), **Deployment** (1),
and **Project notes** (2). The schema row is one token. Commands are `npm ci`
(2), `npm run dev` (3), `npm test` (2), `npm run lint` (3), `npm run
typecheck` (3), `npm run build` (3), and `npm run deploy` (3). The project-note
links all have descriptive two-word labels.

The terminology is consistent: **question**, **question book**, **reading**,
**answer copy**, **expiring link**, **freshness limit**, **threshold**,
**approved source**, and **demo** each identify one concept.

## Demo and sandbox verification

- The landing action opened `/demo` in one click. At 390 × 844, the first
  sample showed “Did Northstar orders arrive?”, “1,842”, “On track”, and
  “Fresh for 60 min”; their bottoms were 641, 681, 737, and 793 px.
- The persistent banner read “Demo — sample data, nothing is saved” on `/demo`
  and `/demo/snapshot`.
- Seeded real question, preview, and share sentinels remained byte-for-byte
  unchanged through Reset and Start for real.
- Reset restored the changed value from 1,999 to 1,842, removed extra `demo:`
  keys, retained only the freshly seeded `demo:tqb:v1`, and changed its `d_`
  expiring link from HTTP 200 to 410.
- Start for real removed every `demo:` key, opened `/book`, preserved every real
  sentinel, and changed its `d_` link from HTTP 200 to 410.
- A separately controlled demo reopened offline with all three cards, the demo
  banner, and “You are offline. Saved questions are still available.”
- The cold landing, demo edit, answer-copy, sharing, Reset, Start, and offline
  flows contacted only `https://telemetry-question-book.sociobot.in`. No
  analytics, external font/script, model, dashboard, account, or payment origin
  appeared.

## Claims audit

The untouched base was cloned to `/tmp/tqb-review8-clean-jBEGeg/repo` at
`cba3093b91d900517df4fd739813e2d34782650c`. After `npm ci`, every literal
`test` command in `.factory/claims.json` ran independently. Every claim ID
appears exactly once in the test sources.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS |
| `demo-controls` | `npm test -- --grep @claim:demo-controls` | PASS |
| `card-fields` | `npm test -- --grep @claim:card-fields` | PASS |
| `local-browser` | `npm test -- --grep @claim:local-browser` | PASS |
| `free-core` | `npm test -- --grep @claim:free-core` | PASS |
| `threshold-states` | `npm test -- --grep @claim:threshold-states` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `offline-sharing` | `npm test -- --grep @claim:offline-sharing` | PASS |
| `question-update` | `npm test -- --grep @claim:question-update` | PASS |
| `csv-import` | `npm test -- --grep @claim:csv-import` | PASS |
| `csv-validation` | `npm test -- --grep @claim:csv-validation` | PASS |
| `csv-schema` | `npm test -- --grep @claim:csv-schema` | PASS |
| `csv-template` | `npm test -- --grep @claim:csv-template` | PASS |
| `question-book-export` | `npm test -- --grep @claim:question-book-export` | PASS |
| `answer-copy-security` | `npm test -- --grep @claim:answer-copy-security` | PASS |
| `answer-copy-download` | `npm test -- --grep @claim:answer-copy-download` | PASS |
| `expiring-share` | `npm test -- --grep @claim:expiring-share` | PASS |
| `share-expiry-options` | `npm test -- --grep @claim:share-expiry-options` | PASS |
| `share-redaction` | `npm test -- --grep @claim:share-redaction` | PASS |
| `share-revocation` | `npm test -- --grep @claim:share-revocation` | PASS |
| `least-privilege-input` | `npm test -- --grep @claim:least-privilege-input` | PASS |
| `sample-sources` | `npm test -- --grep @claim:sample-sources` | PASS |
| `snapshot-retention` | `npm run test:api -- --test-name-pattern @claim:snapshot-retention` | PASS |
| `snapshot-storage-minimization` | `npm run test:api -- --test-name-pattern @claim:snapshot-storage-minimization` | PASS |
| `api-rate-limit` | `npm run test:api -- --test-name-pattern @claim:api-rate-limit` | PASS |
| `health-rate-limit` | `npm run test:api -- --test-name-pattern @claim:health-rate-limit` | PASS |
| `deploy-integrity` | `npm run test:api -- --test-name-pattern @claim:deploy-integrity` | PASS |
| `legacy-migration` | `npm run test:api -- --test-name-pattern @claim:legacy-migration` | PASS |

No landing or README behavior sentence is absent from the claim inventory at
its stated scope. Routine setup commands and exact platform configuration
requirements were separately exercised by the clean build, lint, typecheck,
deployment test, and static-response regression. There is no unlisted or
untested claim.

## Earlier-finding audit

Every `review-*.md`, every `polish-*.md`, and the previous handoff was read.
Each finding was checked against current code/tests and the live deployment;
closure statements were not treated as proof.

| Earlier ID | Current independent verification | Status |
| --- | --- | --- |
| F-1-1 | The phone demo shows its first question, value, state, and freshness by y=793. | Fixed |
| F-1-2 | Demo question, preview, and share storage are separate; the banner persists; real sentinels survive both exits. | Fixed |
| F-1-3 | Server-held random-ID links enforce expiry and revocation, redact by default, and keep answer data out of URLs. | Fixed |
| F-1-4 | The first screen uses a job-first headline and states manual reading/CSV input plus the no-query boundary. | Fixed |
| F-1-5 | `card-fields` checks owner, freshness, threshold, source name, and exact source URL before and after reload. | Fixed |
| F-1-6 | Both demo exits, exact CSV boundaries/template, real-preview isolation, and exact downloaded fields are asserted. | Fixed |
| F-1-7 | All three sample-source routes have distinct live titles and code metadata. | Fixed |
| F-1-8 | `/snapshot` and `/demo/snapshot` remain in the sitemap and are marked `noindex`. | Fixed |
| F-1-9 | The live HTTP 404 has the complete header/footer, metadata, icons, one h1/main, and designed treatment. | Fixed |
| F-1-10 | “Governed” is absent; public copy uses “approved.” | Fixed |
| F-1-11 | “Support-ready” is absent; public copy uses “answer copy.” | Fixed |
| F-1-12 | The preview h2 is “Check the latest approved readings.” | Fixed |
| F-1-13 | Dated-copy text names the hideable owner, source, and note fields without the old jargon. | Fixed |
| F-1-14 | “Question book” remains the collection term; “Questions” is only the compact mobile destination label. | Fixed |
| F-1-15 | The process label remains “Three steps to keep answers current.” | Fixed |
| F-1-16 | The limits h2 is the self-contained “What the question book does not do.” | Fixed |
| F-1-17 | README explains browser storage without “local-first.” | Fixed |
| F-1-18 | README and landing name the tested offline result without service-worker jargon. | Fixed |
| F-1-19 | README states routing, 404, cache, and browser-protection behavior in concrete operator terms. | Fixed |
| F-2-1 | CSV comparisons and strict ISO dates are registered and tested. | Fixed |
| F-2-2 | Offline sharing errors and reconnection recovery are registered and tested. | Fixed |
| F-2-3 | Both Reset and Start revoke `d_` links and clear every demo key independently. | Fixed |
| F-2-4 | Exact sharing metadata and immediate answer deletion on revoke are tested. | Fixed |
| F-2-5 | The read-only health route remains available outside the sharing limit. | Fixed |
| F-2-6 | Whole-book CSV export is workspace-isolated and round-trips without duplicates. | Fixed |
| F-2-7 | All three facts fit the live phone and desktop first screens. | Fixed |
| F-2-8 | The focused mobile skip link sits below the header and does not intercept Demo. | Fixed |
| F-2-9 | Public copy says “random ID,” not “opaque.” | Fixed |
| F-2-10 | Public copy says “this site’s sharing service,” not API jargon. | Fixed |
| F-2-11 | Public copy says “random ID, not the answer.” | Fixed |
| F-2-12 | User-facing sharing copy avoids queue, table, payload, and TTL jargon. | Fixed |
| F-2-13 | Candidate-specific migration history is absent from README. | Fixed |
| F-3-1 | All three expiry choices are registered and measured within five seconds. | Fixed |
| F-3-2 | “Expiring link” is the single public term. | Fixed |
| F-3-3 | Preview separation is described without session-storage jargon. | Fixed |
| F-3-4 | Limit copy names sharing, network address, request 101, HTTP 429, and `Retry-After`. | Fixed |
| F-3-5 | Deployment copy names the `api/` artifact as server functions. | Fixed |
| F-3-6 | Deployment copy omits the ambiguous “first-party” label. | Fixed |
| F-3-7 | Deployment copy names the static/API build-ID comparison directly. | Fixed |
| F-4-1 | The first-screen fact is scoped to question cards; explicit sharing disclosure precedes the POST. | Fixed |
| F-4-2 | The offline fact is scoped to saved-question reopening; sharing still states that a connection is required. | Fixed |
| F-4-3 | Deployment text names the build, commit stamp, static/API comparison, and forged-header check. | Fixed |
| F-4-4 | Deployment integrity and legacy migration remain in the manifest with exact tagged tests. | Fixed |
| F-5-1 | The limits section uses a concrete h2 with no metaphorical replacement. | Fixed |
| F-7-1 | The 390 px live header visibly shows “Telemetry Question Book”; code also tests 390 and 320 px layouts. | Fixed |

The earlier unnumbered findings carried through the review history are also
fixed: recurring readings update without duplicates; the unavailable paid
offer remains removed; all demo source links work; form and CSV validation
share the same rules; touch targets are at least 44 px; the designed focus ring
and dialog focus trap pass; the 404 is CSP-safe and returns HTTP 404; Vite is
current with zero high-severity audit finding; non-hashed art revalidates;
comparison copy has no doubled “at”; the demo count follows stored data;
spoofed forwarding headers do not split the limit; static and API deployment
identity is checked; and primary-button contrast passes Axe.

## Structure, links, accessibility, and identity

- Twenty-four live route/viewport checks covered `/`, `/demo`, `/?demo=1`,
  `/book`, `/privacy`, `/terms`, `/snapshot`, `/demo/snapshot`, all three sample
  sources, and an unknown route at both sizes. Valid routes returned 200; the
  unknown route returned the designed document with HTTP 404.
- Each route has `lang=en`, one h1, one main, a consistent header/footer,
  route-specific title and description, canonical URL, matching Open Graph and
  Twitter metadata, SVG favicon, Apple touch icon, and no missing image alt.
- All live page links returned 200 or were explicit `mailto:`/same-document
  links. `robots.txt`, `sitemap.xml`, the explicit Static Web Apps routes,
  security headers, and the CSP-safe 404 are present.
- Demo navigation focused its h1. Back returned to `/`, restored scroll zero,
  and focused the landing h1. The full clean suite also passed keyboard focus,
  dialog trapping/restoration, reduced motion, 44 px targets, and 320/390 px
  wordmark regressions.
- Axe found zero serious or critical issue across the 24 live scans. The URL
  verifier passed `/` and `/demo` with one h1, one main, `lang=en`, complete alt
  text, labeled buttons, and zero errors. The unknown document produced only
  the browser's expected diagnostic for its intentional 404 response.
- The cream, forest, amber, hard-edged instrument console, paper-card layout,
  original gouache console art, dial motif, and disconnected-console 404 match
  `.factory/design.md` and are visibly distinct from a generic SaaS template.

## Repository verification

- 28/28 literal claim commands: PASS independently from the clean clone.
- `npm test`: PASS — 15 API tests and 34 Playwright tests.
- `npm run lint`, `npm run typecheck`, and `npm run build`: PASS.
- Root and API high-severity dependency audits: PASS, zero vulnerabilities.
- Build output: 36.61 kB JavaScript raw / 11.92 kB gzip and 17.55 kB CSS raw /
  4.95 kB gzip; `dist/index.html` exists.
- Clean-build JavaScript and CSS SHA-256 values match the live hashed assets.
- Live `/build-info.json` and `/api/health` both report
  `22cb671252954e59ac26369452f6a29b2e4bb53a`; snapshot storage is configured.

## Missed leverage

No missing feature is implied strongly enough to be a finding. CSV import,
whole-book CSV export, JSON answer copies, and revocable expiring links cover
the obvious portability and support-handoff needs. Sync would contradict the
stated browser-storage boundary. An AI feature would also be inappropriate:
the brief explicitly prohibits LLM-generated explanations, and no provider key
or model request exists in the product.

## What would make this perfect

Nothing remains to change for the reviewed contract. Future work should only
respond to a changed brief or a newly observed regression; adding sync, AI, or
paid controls now would weaken the current scope rather than complete it.
