# Adversarial first-read review 5 — Telemetry Question Book

**Verdict: FAIL.** Reviewed 2026-08-29 UTC, live at <https://telemetry-question-book.sociobot.in>, in fresh Chromium 1.58.2 contexts at 390 × 844 and 1440 × 900. Product code was not modified. One minor finding remains, so PASS is not available.

## Cold first read

Before scrolling, I understood that this tracks recurring answers from readings a person enters or imports; it is for support teams without broad dashboard access; and I should click **Try it with sample data**. The exact first-screen copy was “Track recurring answers from approved readings,” “For support teams: enter a reading or approved CSV. The app does not query dashboards,” “Try it with sample data,” and “Opens a filled question book in one click.”

The gate passes at both sizes. The three fact lines ended at y=716, 774, 807 on phone and y=650, 683, 716 on desktop. Cold loads made only document, same-origin JS/CSS, and same-origin hero-image requests; created no storage; had no normal-load console/page error; and had no horizontal overflow.

## Finding

### Minor

#### F-5-1 — The limits h2 is a metaphor, not a section name

- **Exact location:** landing `<h2>` below “What the question book does not do”: “It translates readings. It does not replace telemetry.”
- **Why:** In a screen-reader heading list it does not name the section. “Translates readings” is metaphorical and does not state a concrete limit; the visual eyebrow supplies context a heading must carry itself.
- **Fix:** Remove the eyebrow and use the h2 **“What the question book does not do”**. Keep the four boundary bullets.

## Copy audit

Counting rule: whitespace-delimited words; URLs, paths, identifiers, and hyphenated terms count as one. No sentence is over 22 words. No banned marketing word, inconsistent term, unlisted claim, or non-result-naming button was found. Headings/labels were checked too; F-5-1 is the sole copy flag.

### Landing

| Words | Sentence or reader-facing copy | Result |
| ---: | --- | --- |
| 4 | Approved readings · plain answers | Pass |
| 6 | Track recurring answers from approved readings | Pass; h1 |
| 9 | For support teams: enter a reading or approved CSV. | Pass |
| 6 | The app does not query dashboards. | Pass |
| 5 | Try it with sample data | Pass |
| 8 | Opens a filled question book in one click. | Pass |
| 6 | Question cards stay in this browser. | Pass |
| 8 | Saved questions reopen offline after one online visit. | Pass |
| 3 / 3 | Free to use. / No account needed. | Pass |
| 11 | An instrument console turns telemetry paper into a blank answer ticket. | Pass; alt |
| 4 / 4 | One approved reading in. / One answer copy out. | Pass |
| 2 / 5 | Live preview / Check the latest approved readings | Pass |
| 11 | Each question keeps its owner, freshness limit, threshold, and approved source. | Pass |
| 6 / 5 | Three steps to keep answers current / How the question book works | Pass |
| 3 / 8 | Name the question / Write the customer question and assign its owner. | Pass |
| 4 / 10 | Add an approved reading / Paste a read-only link or import an approved CSV export. | Pass |
| 3 / 5 / 9 | Share the answer / Create an expiring link. / Choose whether to hide the owner, source, and note. | Pass |
| 7 | What the question book does not do | Pass; correct section name is currently only the eyebrow |
| 8 | It translates readings. It does not replace telemetry. | **F-5-1** |
| 7 / 6 / 7 / 6 | It does not ingest logs or metrics. / It does not write query language. / It does not alert or monitor systems. / It never asks for dashboard credentials. | Pass |
| 6 | Plain answers from approved telemetry readings. | Pass |
| 6 / 10 | Built by Param Factory (external site) / Version 1.3.0 · Generated illustration disclosed in the design notes. | Pass |

Sample-question values, source names, owner/freshness/threshold/status labels, navigation labels, and controls are not sentences. They were checked separately: they are specific, consistent, and use “question book” and “expiring link” consistently.

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 6 / 15 | Track recurring answers from approved readings. / This browser-based app is for engineering and support pairs who cannot share broad dashboard access. | Pass |
| 8 / 6 / 14 / 8 | Enter a reading or import an approved CSV. / The app does not query dashboards. / The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. / Saved questions reopen offline after one online visit. | Pass |
| 9 / 15 | Try the isolated sample at `/demo`, `/?demo=1`, or <https://telemetry-question-book.sociobot.in/demo>. / Demo changes use `demo:` storage keys and never read or change the real question book. | Pass |
| 7 / 9 / 9 / 9 | Saves approved question cards in the browser. / Updates a recurring reading without making a duplicate card. / Imports new CSV rows and updates matching question names. / Marks readings as on track, needs attention, or stale. | Pass |
| 6 / 8 / 10 | Creates expiring links with random IDs. / Choose 1 hour, 24 hours, or 7 days. / Lets the creator revoke an expiring link before it expires. | Pass |
| 8 / 6 / 8 / 10 | Exports every saved question as a CSV backup. / Downloads dated answer copies as JSON. / Hides the owner, source, and note by default. / Accepts approved HTTPS links and never asks for dashboard credentials. | Pass |
| 11 | It does not ingest telemetry, create queries, or alert on systems. | Pass |
| 7 / 2 / 6 | Requirements: Node.js 20 or newer and npm. / Open `http://localhost:5173`. / The direct demo URL is `http://localhost:5173/?demo=1`. | Pass |
| 15 / 10 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. / Static output lands in `dist/`, with `dist/index.html` at its root. | Pass |
| 14 / 10 | After one online visit, the app caches the files it needs to reopen offline. / Creating or opening an expiring link still needs a connection. | Pass |
| 8 / 11 / 3 | Use **Download CSV template** for a starter file. / Use **Export question book CSV** to back up every saved card. / Required columns are: | Pass |
| 6 / 5 / 5 / 10 | `comparison` accepts `gte`, `lte`, or `eq`. / `observedAt` accepts an ISO date. / Source URLs must use HTTPS. / `freshMinutes` must be a whole number from 1 through 10,080. | Pass |
| 4 / 4 / 9 / 6 | Real questions use `tqb:v1`. / Demo questions use `demo:tqb:v1`. / The browser stores real and demo answer previews separately. / Preview data never enters the URL. | Pass |
| 13 / 9 / 9 / 6 / 8 | Creating an expiring link sends the reviewed copy to this site’s sharing service. / The link contains a random ID, not the answer. / The service checks expiry and revocation on every read. / Demo link IDs start with `d_`. / **Reset demo** and **Start for real** revoke them. | Pass |
| 11 / 13 / 16 / 6 | The reviewed answer is stored separately until its chosen expiry time. / Azure Storage removes it automatically at expiry, even when nobody opens the link. / The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. / Revocation deletes the reviewed answer immediately. | Pass |
| 8 / 12 / 8 / 7 | The sharing service groups requests by network address. / Each address can create, open, or revoke 100 links in 60 seconds. / The 101st request returns HTTP `429` with `Retry-After`. / Health checks do not use this limit. | Pass |
| 9 / 6 / 8 / 4 | Downloaded files do not expire or provide access control. / Do not put secrets in them. / The app has no account service or analytics. / See `/privacy` and `/terms`. | Pass |
| 9 | This release is free and has no purchase flow. | Pass |
| 6 / 10 / 8 / 9 / 12 | Deploy from a clean, committed checkout: / The command builds `dist/` and the server functions in `api/`. / It sets `BUILD_ID` to the commit being deployed. / After deployment, it confirms that `/api/health` reports that commit. / It also confirms that forged network-address headers cannot bypass the 100-request limit. | Pass |
| 14 / 8 / 4 | The deployed app needs a secret `SnapshotStorage` setting for its approved Azure Storage account. / The connection needs Table and Queue service access. / Never commit its value. | Pass |
| 14 / 9 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. / The command migrates active answers and removes expired ones. | Pass |
| 16 / 8 / 2 / 2 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. / Azure Static Web Apps reads it during deployment. / MIT licensed. / See [LICENSE](LICENSE). | Pass |

README headings, commands, schema line, and note links are non-sentence copy; all are clear and under the cap. Every behavior sentence maps to an entry in `.factory/claims.json`; no unlisted claim remains.

## Demo, claims, privacy, and leverage

One click opened `/demo` with three named samples, a persistent “Demo — sample data, nothing is saved” banner, and the first Northstar question/state/freshness visible before scrolling at 390 px. I pre-seeded real question, preview, and share sentinels. Demo created only `demo:tqb:v1`; Reset restored samples; real sentinels stayed byte-for-byte unchanged. Normal landing/demo requests were same-origin only, with no analytics, account, payment, model, dashboard, external-font, or third-party request.

From a clean clone at `/tmp/tqb-review-5`, after `npm ci` and `npm --prefix api ci`, all 28 exact claim commands passed: `demo-sandbox`, `demo-controls`, `card-fields`, `local-browser`, `free-core`, `threshold-states`, `offline-reload`, `offline-sharing`, `question-update`, `csv-import`, `csv-validation`, `csv-schema`, `csv-template`, `question-book-export`, `answer-copy-security`, `answer-copy-download`, `expiring-share`, `share-expiry-options`, `share-redaction`, `share-revocation`, `least-privilege-input`, `sample-sources`, `snapshot-retention`, `snapshot-storage-minimization`, `api-rate-limit`, `health-rate-limit`, `deploy-integrity`, `legacy-migration`.

The full suite passed (15 API, 32 Playwright); lint, typecheck, build, and both high-severity dependency audits passed. Production JS is 36.53 kB raw / 11.91 kB gzip. No AI feature is appropriate: the brief prohibits LLM-generated explanations; CSV import/export, JSON download, and revocable expiring links cover the implied portability and handoff needs.

## History, structure, and identity

I read every earlier review, polish report, and handoff, then checked current code and live behavior. The following are individually fixed: F-1-1, F-1-2, F-1-3, F-1-4, F-1-5, F-1-6, F-1-7, F-1-8, F-1-9, F-1-10, F-1-11, F-1-12, F-1-13, F-1-14, F-1-15, F-1-17, F-1-18, F-1-19; F-2-1 through F-2-13; F-3-1 through F-3-7; and F-4-1 through F-4-4. F-1-16 is fixed in the eyebrow and boundary bullets but has the remaining h2 regression recorded as F-5-1.

`/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, `/demo/snapshot`, and all three sample sources returned 200; unknown routes returned the styled HTTP 404. At both sizes all checked routes had `lang`, one h1, one main, route titles/descriptions/canonicals/OG/Twitter metadata, favicon, Apple touch icon, and no overflow. Demo navigation focused its h1; Back restored landing focus and scroll zero. Crawled page links returned 200 (or explicit mailto). Live Axe scans had zero serious/critical violations. The original cream/forest/amber instrument-panel artwork, paper cards, hard-edged switches, and disconnected-console 404 match `.factory/design.md` and are distinct from a generic SaaS template.

## What would make this perfect

Apply F-5-1, then repeat this complete fresh-context review. With zero findings, the product can receive PASS.
