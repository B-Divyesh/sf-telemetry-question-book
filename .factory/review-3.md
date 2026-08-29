# Adversarial first-read review 3 — Telemetry Question Book

**Verdict: FAIL**

Reviewed 29 August 2026 UTC against <https://telemetry-question-book.sociobot.in> from fresh Chromium 1.58.2 contexts at 390 × 844 and 1440 × 900. Product code was not modified. One major and six minor findings remain. All 25 declared claim commands pass independently from a clean clone, but one quantitative README claim is absent from the claim inventory and its exact values are untested.

## Cold first read

Before scrolling, my answers were:

- **What does this do?** It tracks recurring answers from readings that a person enters or imports.
- **For whom?** Support teams that need answers without broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This blocking gate passes at both sizes. The exact text supplying those answers is “Track recurring answers from approved readings,” “For support teams: enter a reading or approved CSV. The app does not query dashboards,” and “Try it with sample data,” followed by “Opens a filled question book in one click.”

At 390 × 844, the three facts end at 659, 710, and 740 px. At 1440 × 900, they end at 650, 679, and 709 px. The primary action is also inside each initial viewport. Cold landing contexts had no local- or session-storage keys, made four same-origin requests, and produced no console or page errors.

## Findings

### Major

#### F-3-1 — The three advertised expiry choices are an unlisted, untested quantitative claim

- **Exact quote/location:** `README.md:15`: “Creates answer links with random IDs that expire after 1 hour, 24 hours, or 7 days.” The live selector also offers **1 hour**, **24 hours**, and **7 days**.
- **Manifest/test gap:** `.factory/claims.json` has no entry containing those three durations. `@claim:expiring-share` creates the default link without measuring its deadline, then tests a separate one-second fixture. It does not select or measure 1 hour, 24 hours, or 7 days.
- **Why this matters:** A visitor can rely on the exact retention choices. The claims contract requires each quantitative promise to appear in the manifest and be measured by its tagged test. Passing the adjacent expiry test does not cover these numbers.
- **Concrete fix:** Add a `share-expiry-options` claim naming all three choices. Its tagged test should select each option, assert the request sends `3600`, `86400`, or `604800`, and assert the returned `expiresAt` matches the selected duration within a stated clock tolerance. Alternatively, remove the exact durations from public copy.

### Minor

#### F-3-2 — One concept has three public names

- **Exact quotes/locations:** README: “Creates **answer links**…”; README elsewhere: “an **expiring link**”; landing step: “Create an **expiring answer link**.” The terminology table in `.factory/copy-audit.md` calls this concept an “expiring link.”
- **Why this matters:** A first-time reader has to decide whether these are different outputs. “Answer copy” is already a separate concept, so “answer link” increases that ambiguity.
- **Concrete rewrite:** Use **expiring link** throughout. For example: “Creates expiring links with random IDs. Choose 1 hour, 24 hours, or 7 days.” Change the landing sentence to “Create an expiring link.”

#### F-3-3 — “Session-storage keys” exposes browser implementation jargon

- **Exact quote/location:** `README.md:60`: “Real and demo answer previews use separate session-storage keys.”
- **Why this matters:** The useful privacy fact is separation, not the browser API vocabulary.
- **Concrete rewrite:** “The browser stores real and demo answer previews separately.”

#### F-3-4 — The rate-limit explanation uses internal and ambiguous terms

- **Exact quote/location:** `README.md:66`: “The anonymous snapshot routes share an allowance of 100 requests per client in each 60-second window.” It later calls `/api/health` “exempt.”
- **Why this matters:** “Snapshot routes,” “allowance,” “client,” and “exempt” require API context. The code actually groups requests by network address, so “per client” can also imply a browser or account that the implementation does not identify.
- **Concrete rewrite:** “The sharing service groups requests by network address. Each address can create, open, or revoke 100 links in 60 seconds. The 101st request returns HTTP `429` and a `Retry-After` time. Health checks do not use this limit.” Update the claim text to use the same term.

#### F-3-5 — “Managed functions” does not identify the deployment artifact

- **Exact quote/location:** `README.md:76`: “Run `npm run build`, then deploy `dist/` with the managed functions in `api/`:”
- **Why this matters:** “Managed” does not tell an operator what the functions are or what action to take with them.
- **Concrete rewrite:** “Run `npm run build`, then deploy `dist/` together with the server functions in `api/`:”

#### F-3-6 — “First-party” is avoidable deployment jargon

- **Exact quote/location:** `README.md:82`: “The Static Web App needs a secret `SnapshotStorage` app setting that points to the approved first-party Azure Storage account.”
- **Why this matters:** “First-party” depends on unstated ownership context.
- **Concrete rewrite:** “The deployed app needs a secret `SnapshotStorage` setting for the approved Azure Storage account owned by this service.”

#### F-3-7 — “Parity checks” does not state what the operator verifies

- **Exact quote/location:** `README.md:82`: “Set non-secret `BUILD_ID` to the deployed commit; `/api/health` reports it for parity checks.”
- **Why this matters:** The sentence hides the result behind release terminology.
- **Concrete rewrite:** “Set `BUILD_ID` to the deployed commit so `/api/health` reports which commit is running.”

## Copy audit

Counting rule: whitespace-delimited words; hyphenated terms, URLs, paths, and version numbers count as one word. This audit includes headings, navigation, actions, labels, code commands, and link labels so contextless copy is not skipped. No copy unit exceeds 22 words. No supplied banned marketing word appears. Landing actions name their result. Flags are F-3-1 through F-3-7.

### Landing page

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 4 | Skip to main content | Pass |
| 2 | 3 | Telemetry Question Book | Pass |
| 3 | 1 | Demo | Pass; navigation |
| 4 | 3 | My question book | Pass; navigation |
| 5 | 1 | Privacy | Pass; navigation |
| 6 | 5 | Approved readings · plain answers | Pass; names input and output |
| 7 | 6 | Track recurring answers from approved readings | Pass; job-first headline |
| 8 | 9 | For support teams: enter a reading or approved CSV. | Pass |
| 9 | 6 | The app does not query dashboards. | Pass |
| 10 | 5 | Try it with sample data | Pass; result-naming action |
| 11 | 8 | Opens a filled question book in one click. | Pass |
| 12 | 5 | Data stays in this browser. | Pass; `local-browser` |
| 13 | 7 | Works after the first visit, even offline. | Pass; `offline-reload` |
| 14 | 3 | Free to use. | Pass; `free-core` |
| 15 | 3 | No account needed. | Pass; `free-core` |
| 16 | 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; image alt |
| 17 | 4 | One approved reading in. | Pass |
| 18 | 4 | One answer copy out. | Pass |
| 19 | 2 | Live preview | Pass |
| 20 | 5 | Check the latest approved readings | Pass |
| 21 | 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass; `card-fields` |
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
| 45 | 5 | Create an expiring answer link. | F-3-2 |
| 46 | 9 | Choose whether to hide the owner, source, and note. | Pass; `share-redaction` |
| 47 | 7 | What the question book does not do | Pass |
| 48 | 3 | It translates readings. | Pass |
| 49 | 5 | It does not replace telemetry. | Pass |
| 50 | 7 | It does not ingest logs or metrics. | Pass; `local-browser` |
| 51 | 6 | It does not write query language. | Pass; `local-browser` |
| 52 | 7 | It does not alert or monitor systems. | Pass; `local-browser` |
| 53 | 6 | It never asks for dashboard credentials. | Pass; `least-privilege-input` |
| 54 | 6 | Plain answers from approved telemetry readings. | Pass |
| 55 | 1 | Privacy | Pass; link |
| 56 | 1 | Terms | Pass; link |
| 57 | 6 | Built by Param Factory (external site) | Pass; link |
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
| 7 | 8 | It works after the first visit, even offline. | Pass |
| 8 | 9 | Try the isolated sample at `/demo`, `/?demo=1`, or `https://telemetry-question-book.sociobot.in/demo`. | Pass |
| 9 | 15 | Demo changes use `demo:` storage keys and never read or change the real question book. | Pass |
| 10 | 3 | What it does | Pass |
| 11 | 7 | Saves approved question cards in the browser. | Pass |
| 12 | 9 | Updates a recurring reading without making a duplicate card. | Pass |
| 13 | 9 | Imports new CSV rows and updates matching question names. | Pass |
| 14 | 9 | Marks readings as on track, needs attention, or stale. | Pass |
| 15 | 16 | Creates answer links with random IDs that expire after 1 hour, 24 hours, or 7 days. | F-3-1, F-3-2 |
| 16 | 10 | Lets the creator revoke an answer link before it expires. | F-3-2 |
| 17 | 8 | Exports every saved question as a CSV backup. | Pass |
| 18 | 6 | Downloads dated answer copies as JSON. | Pass |
| 19 | 8 | Hides the owner, source, and note by default. | Pass |
| 20 | 10 | Accepts approved HTTPS links and never asks for dashboard credentials. | Pass |
| 21 | 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass |
| 22 | 2 | Run locally | Pass |
| 23 | 7 | Requirements: Node.js 20 or newer and npm. | Pass |
| 24 | 2 | `npm ci` | Pass; command |
| 25 | 3 | `npm run dev` | Pass; command |
| 26 | 2 | Open `http://localhost:5173`. | Pass |
| 27 | 6 | The direct demo URL is `http://localhost:5173/?demo=1`. | Pass |
| 28 | 3 | Test and build | Pass |
| 29 | 2 | `npm test` | Pass; command |
| 30 | 3 | `npm run lint` | Pass; command |
| 31 | 3 | `npm run typecheck` | Pass; command |
| 32 | 3 | `npm run build` | Pass; command |
| 33 | 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. | Pass |
| 34 | 10 | Static output lands in `dist/`, with `dist/index.html` at its root. | Pass |
| 35 | 14 | After one online visit, the app caches the files it needs to reopen offline. | Pass |
| 36 | 10 | Creating or opening an expiring link still needs a connection. | Pass |
| 37 | 2 | CSV format | Pass |
| 38 | 8 | Use Download CSV template for a starter file. | Pass |
| 39 | 11 | Use Export question book CSV to back up every saved card. | Pass |
| 40 | 3 | Required columns are: | Pass |
| 41 | 1 | `question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note` | Pass; schema line |
| 42 | 6 | `comparison` accepts `gte`, `lte`, or `eq`. | Pass |
| 43 | 5 | `observedAt` accepts an ISO date. | Pass |
| 44 | 5 | Source URLs must use HTTPS. | Pass |
| 45 | 10 | `freshMinutes` must be a whole number from 1 through 10,080. | Pass |
| 46 | 3 | Data and sharing | Pass |
| 47 | 4 | Real questions use `tqb:v1`. | Pass |
| 48 | 4 | Demo questions use `demo:tqb:v1`. | Pass |
| 49 | 9 | Real and demo answer previews use separate session-storage keys. | F-3-3 |
| 50 | 6 | Preview data never enters the URL. | Pass |
| 51 | 13 | Creating an expiring link sends the reviewed copy to this site’s sharing service. | Pass |
| 52 | 9 | The link contains a random ID, not the answer. | Pass |
| 53 | 9 | The service checks expiry and revocation on every read. | Pass |
| 54 | 6 | Demo link IDs start with `d_`. | Pass |
| 55 | 8 | Reset demo and Start for real revoke them. | Pass |
| 56 | 11 | The reviewed answer is stored separately until its chosen expiry time. | Pass |
| 57 | 13 | Azure Storage removes it automatically at expiry, even when nobody opens the link. | Pass |
| 58 | 16 | The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. | Pass |
| 59 | 6 | Revocation deletes the reviewed answer immediately. | Pass |
| 60 | 16 | The anonymous snapshot routes share an allowance of 100 requests per client in each 60-second window. | F-3-4 |
| 61 | 9 | This allowance covers create, open, and revoke requests together. | F-3-4 |
| 62 | 7 | Request 101 returns HTTP `429` with `Retry-After`. | Pass; necessary protocol detail |
| 63 | 5 | `/api/health` is read-only and exempt. | F-3-4 |
| 64 | 9 | Downloaded files do not expire or provide access control. | Pass |
| 65 | 6 | Do not put secrets in them. | Pass |
| 66 | 8 | The app has no account service or analytics. | Pass |
| 67 | 4 | See `/privacy` and `/terms`. | Pass |
| 68 | 1 | Pricing | Pass |
| 69 | 9 | This release is free and has no purchase flow. | Pass |
| 70 | 1 | Deployment | Pass |
| 71 | 13 | Run `npm run build`, then deploy `dist/` with the managed functions in `api/`: | F-3-5 |
| 72 | 3 | `/opt/fleet/lib/deploy-static.sh telemetry-question-book dist` | Pass; command |
| 73 | 19 | The Static Web App needs a secret `SnapshotStorage` app setting that points to the approved first-party Azure Storage account. | F-3-6 |
| 74 | 8 | The connection needs Table and Queue service access. | Pass; required Azure permission names |
| 75 | 4 | Never commit its value. | Pass |
| 76 | 13 | Set non-secret `BUILD_ID` to the deployed commit; `/api/health` reports it for parity checks. | F-3-7 |
| 77 | 14 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. | Pass |
| 78 | 9 | The command migrates active answers and removes expired ones. | Pass |
| 79 | 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. | Pass |
| 80 | 8 | Azure Static Web Apps reads it during deployment. | Pass |
| 81 | 2 | Project notes | Pass |
| 82 | 2 | Visual system | Pass; link label |
| 83 | 2 | Verified claims | Pass; link label |
| 84 | 2 | Demo contract | Pass; link label |
| 85 | 2 | Build handoff | Pass; link label |
| 86 | 2 | MIT licensed. | Pass |
| 87 | 2 | See LICENSE. | Pass |

## Demo, sandbox, privacy, and offline

- One click from `/` opens `/demo` with three named samples and a sticky “Demo — sample data, nothing is saved” banner.
- On 390 × 844, the first sample’s question, value, state, and freshness end at 630, 670, 719, and 763 px. They are all visible without scrolling.
- Changing Northstar to `1,999`, then selecting **Reset demo**, restores `1,842`.
- Seeded real question, preview, and share values remain byte-for-byte unchanged after reset, answer-copy creation, and **Start for real**.
- A created demo link uses a `d_` ID, returns `200`, and returns `410` after **Start for real**. Every `demo:` key is removed; the real keys remain.
- `/demo/snapshot` retains the demo banner and uses `demo:tqb:snapshot-preview`, not the real preview key.
- After the service worker controls the page, `/demo` reloads offline with all three cards and the visible offline notice.
- The landing, demo, edit, reset, preview, share, leave-demo, and offline flows make same-origin requests only. No analytics, fonts, scripts, model calls, dashboard calls, or account calls leave the origin.

## Claim execution

The repository was cloned at `b0d06e14dd5befdc244b4b3773f5fd3e0db6f63d` into `/tmp/tqb-review3-clean-sHTYCQ/repo`. After `npm ci`, every exact `test` command in `.factory/claims.json` ran independently from that clone. Every claim ID occurs exactly once in the test sources.

| Claim | Exact command result |
| --- | --- |
| `demo-sandbox` | PASS |
| `demo-controls` | PASS |
| `card-fields` | PASS |
| `local-browser` | PASS |
| `free-core` | PASS |
| `threshold-states` | PASS |
| `offline-reload` | PASS |
| `offline-sharing` | PASS |
| `question-update` | PASS |
| `csv-import` | PASS |
| `csv-validation` | PASS |
| `csv-schema` | PASS |
| `csv-template` | PASS |
| `question-book-export` | PASS |
| `answer-copy-security` | PASS |
| `answer-copy-download` | PASS |
| `expiring-share` | PASS; does not cover the exact duration claim in F-3-1 |
| `share-redaction` | PASS |
| `share-revocation` | PASS |
| `least-privilege-input` | PASS |
| `sample-sources` | PASS |
| `snapshot-retention` | PASS |
| `snapshot-storage-minimization` | PASS |
| `api-rate-limit` | PASS |
| `health-rate-limit` | PASS |

No declared claim test fails. F-3-1 is the only claim-like landing/README statement without a matching manifest entry at its stated specificity.

## Earlier-finding audit

Every finding from `.factory/review-1.md` and `.factory/review-2.md` was checked against both the current code and the live deployment. The polish reports and handoff were read but were not treated as proof.

| Earlier ID | Current verification | Status |
| --- | --- | --- |
| F-1-1 | Phone demo question/value/state/freshness end at 630/670/719/763 px. | Fixed |
| F-1-2 | Demo preview, share, and question keys are separate; the banner persists; reset/leave preserve real sentinels. | Fixed |
| F-1-3 | Live demo share opens with `200`, uses a random `d_` ID, and becomes `410` after revocation on exit. | Fixed |
| F-1-4 | Headline is “Track recurring answers from approved readings”; the manual entry/import boundary is in the first screen. | Fixed |
| F-1-5 | `@claim:card-fields` checks owner, freshness, threshold, source name, and exact source URL before and after reload. | Fixed |
| F-1-6 | Tagged tests complete both validation paths, all free workflows, valid HTTPS save, and the three rate-limited route handlers. | Fixed |
| F-1-7 | The three sample pages have distinct source-specific titles live and in `setMetadata`. | Fixed |
| F-1-8 | `/snapshot` and `/demo/snapshot` are in `sitemap.xml`; transient pages set `noindex`. | Fixed |
| F-1-9 | The HTTP 404 has the standard navigation/footer, icons, social metadata, one h1, and zero serious/critical axe findings. | Fixed |
| F-1-10 | “Governed” is absent; the live caption says “approved.” | Fixed |
| F-1-11 | “Support-ready” is absent; the live caption says “answer copy.” | Fixed |
| F-1-12 | The live preview heading is “Check the latest approved readings.” | Fixed |
| F-1-13 | “Point-in-time” and “redaction” are absent from landing/README copy; hidden fields are named. | Fixed |
| F-1-14 | Navigation and documentation use “question book.” | Fixed |
| F-1-15 | The process label is “Three steps to keep answers current.” | Fixed |
| F-1-16 | The boundary label is “What the question book does not do.” | Fixed |
| F-1-17 | README explains browser storage without “local-first.” | Fixed |
| F-1-18 | README states the offline result instead of service-worker jargon. | Fixed |
| F-1-19 | README explains routing, 404, caching, and browser protections in operator terms. New deployment wording issues are F-3-5 through F-3-7, not regressions of the original sentence. | Fixed |
| F-2-1 | `csv-schema` is registered and tests all three comparisons plus valid and invalid dates. | Fixed |
| F-2-2 | `offline-sharing` tests plain offline create/open errors and reconnection recovery. | Fixed |
| F-2-3 | `demo-controls` names and tests `d_` IDs plus reset/leave revocation. | Fixed |
| F-2-4 | `snapshot-storage-minimization` compares the metadata keys and confirms immediate payload deletion. | Fixed |
| F-2-5 | `health-rate-limit` is registered and its 200-call tagged test passes. | Fixed |
| F-2-6 | **Export question book CSV** exports only the active workspace and round-trips without duplicates. | Fixed |
| F-2-7 | All three facts fit the live 1440 × 900 viewport, ending at 709 px. | Fixed |
| F-2-8 | After keyboard focus settles, the skip link is visible at x=12–237 and y=92–141; Demo is at y=16–64, so they do not overlap. Clicking Demo works. | Fixed |
| F-2-9 | “Opaque answer links” is absent. | Fixed |
| F-2-10 | “First-party snapshot API” is absent from user workflow copy. | Fixed |
| F-2-11 | “Opaque token” is absent; public copy says random ID. | Fixed |
| F-2-12 | Queue/table/payload/TTL prose is absent from the data-sharing explanation. | Fixed |
| F-2-13 | Candidate-specific migration lore is absent; README gives only the current version condition. | Fixed |

No earlier finding is unfixed, half-fixed, or regressed, so none is reopened under its old ID.

## Structure, links, accessibility, and identity

- All tested app routes return `200`; the unknown route returns the designed instrument-panel `404`. Every route has one h1, one main landmark, `lang="en"`, a route-specific title under 60 characters, a description under 155 characters, canonical metadata, shared header/footer, and no missing image alt.
- Open Graph/Twitter metadata points to the original 1200 × 630 product artwork. SVG favicon and 180 × 180 Apple icon return `200`.
- `robots.txt`, `sitemap.xml`, deep links, query demo entry, and the Static Web Apps routing/CSP configuration are present. Valid routes have no console/page errors. The browser’s expected network diagnostic for the deliberate HTTP 404 is not an application error.
- Landing links, all declared routes, all three sample sources, legal links, assets, and the external Param Factory link return `200`; the two email links use `mailto:`. The created `/s/<id>` link returns `200` before revocation.
- History back returns to `/`, scrolls to 0, and focuses the landing h1. Keyboard entry, the focused skip link, dialog operation, reduced-motion rules, and 44 px mobile targets are present.
- Mobile and desktop live axe scans found zero serious or critical violations. `/opt/fleet/lib/verify-url.sh` reported title/lang/main/alt/button checks passing and no errors.
- The mid-century instrument-panel layout, cream/forest/amber palette, narrow display type, monospaced data, paper-card construction, original console art, and disconnected-console 404 match `.factory/design.md` and do not present as a generic SaaS template.
- Production JavaScript is 35,859 bytes raw / 11.68 kB gzip; CSS is 16,907 bytes raw / 4.82 kB gzip. No third-party font or script is loaded.

## Repository verification

From the clean clone:

- 25/25 exact claim commands: PASS.
- `npm test`: PASS — 14 API tests and 29 Playwright tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` produced.
- Root and production API high-severity dependency audits: PASS; zero vulnerabilities.

## Missed leverage

No additional AI feature is justified. The brief explicitly says not to generate explanations with an LLM, and no model provider or key appears in the client. The obvious local-data safeguard from the prior round—full CSV export and round-trip import—is now present and tested. Cloud sync would change the local-first privacy model rather than complete an implied job, so its absence is not a finding.

## What would make this perfect

Register and test the three exact expiry choices, standardize the link term, and replace the five flagged jargon phrases with the proposed plain rewrites. Then rerun the full copy, claims, live demo, route, privacy, accessibility, and earlier-finding checks. Until that produces zero findings, the required verdict remains FAIL.
