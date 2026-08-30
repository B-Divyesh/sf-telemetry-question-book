# Adversarial first-read review 7 — Telemetry Question Book

**Verdict: FAIL.** Reviewed 2026-08-30 UTC against
<https://telemetry-question-book.sociobot.in> in fresh Chromium 1.58.2
contexts at 390 × 844 and 1440 × 900. Product code was not modified. One
minor structural finding remains; therefore this is not a zero-finding pass.

## Cold first read

Before scrolling, the answers were:

- **What does this do?** It records recurring telemetry answers from readings a
  person enters or imports.
- **For whom?** Support teams without broad dashboard access.
- **What should I click first?** **Try it with sample data**.

This gate passes at both viewport sizes. The exact first-screen text is “Track
recurring answers from approved readings,” “For support teams: enter a reading
or approved CSV. The app does not query dashboards.” and “Try it with sample
data.” Its adjacent explanation says “Opens a filled question book in one
click.” At 390 px all three facts are visible before scrolling. Cold root loads
made only same-origin requests, created no storage keys, had no application
console or page errors, and had no horizontal overflow.

## Finding

### Minor

#### F-7-1 — The mobile header has no visible wordmark or identifiable home control

- **Exact location:** 390 × 844, every app route. The leftmost header control
  is a 44 × 44 circular dial icon. The visible text “Telemetry Question Book”
  is hidden by the mobile rule (`display: none`); its anchor has only the
  programmatic name `Telemetry Question Book home`.
- **Why this matters:** A first-time phone visitor cannot identify the dial as
  the product wordmark or know that it returns home. This misses the required
  consistent `wordmark → home` header structure even though the accessible name
  is present. The desktop header does show the wordmark, so the inconsistency is
  specifically a mobile regression.
- **Concrete fix:** Keep a visible product wordmark on mobile, for example
  “Telemetry Question Book” in a compact two-line treatment beside the dial.
  If space is tight, shorten the visible `My question book` navigation label;
  do not hide the product identity. Add a 390 px regression that asserts the
  header's visible home link contains the product name.

## Copy audit

Counting uses whitespace-delimited words; URLs, paths, identifiers, and
hyphenated terms each count as one word. Every sentence is at most 22 words.
No banned marketing term, unexplained jargon, metaphor heading, inconsistent
term, or non-result-naming action was found. Headings and labels were also
checked: they name their sections or controls. The existing
`.factory/copy-audit.md` independently records the full landing audit.

### Landing reader-facing sentences

| Words | Exact copy |
| ---: | --- |
| 6 | Track recurring answers from approved readings |
| 9 | For support teams: enter a reading or approved CSV. |
| 6 | The app does not query dashboards. |
| 8 | Opens a filled question book in one click. |
| 6 | Question cards stay in this browser. |
| 8 | Saved questions reopen offline after one online visit. |
| 3 | Free to use. |
| 3 | No account needed. |
| 11 | An instrument console turns telemetry paper into a blank answer ticket. |
| 4 | One approved reading in. |
| 4 | One answer copy out. |
| 11 | Each question keeps its owner, freshness limit, threshold, and approved source. |
| 6 | Passes when at least 1,500 orders |
| 6 | Passes when at most 10 queued |
| 8 | Write the customer question and assign its owner. |
| 10 | Paste a read-only link or import an approved CSV export. |
| 5 | Create an expiring link. |
| 9 | Choose whether to hide the owner, source, and note. |
| 7 | It does not ingest logs or metrics. |
| 6 | It does not write query language. |
| 7 | It does not alert or monitor systems. |
| 6 | It never asks for dashboard credentials. |
| 6 | Plain answers from approved telemetry readings. |
| 10 | Version 1.3.0 · Generated illustration disclosed in the design notes. |

The remaining landing labels/headings are: “Skip to main content” (4),
“Telemetry Question Book” (3), “Demo” (1), “My question book” (3), “Privacy”
(1), “Approved readings · plain answers” (5), “Try it with sample data” (5),
“Live preview” (2), “Check the latest approved readings” (5), the two
sample-question labels and readings, “Three steps to keep answers current”
(6), “How the question book works” (5), “Name the question” (3), “Add an
approved reading” (4), “Share the answer” (3), “What the question book does
not do” (7), “Terms” (1), and “Built by Param Factory (external site)” (6).
They are all clear, useful, and at or below 22 words. The only header issue is
F-7-1's hidden visible wordmark.

### README sentences

| Words | Exact sentence |
| ---: | --- |
| 6 | Track recurring answers from approved readings. |
| 15 | This browser-based app is for engineering and support pairs who cannot share broad dashboard access. |
| 8 | Enter a reading or import an approved CSV. |
| 6 | The app does not query dashboards. |
| 14 | The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. |
| 8 | Saved questions reopen offline after one online visit. |
| 15 | Try the isolated sample at `/demo`, `/?demo=1`, or `https://telemetry-question-book.sociobot.in/demo`. |
| 15 | Demo changes use `demo:` storage keys and never read or change the real question book. |
| 7 | Saves approved question cards in the browser. |
| 9 | Updates a recurring reading without making a duplicate card. |
| 9 | Imports new CSV rows and updates matching question names. |
| 9 | Marks readings as on track, needs attention, or stale. |
| 6 | Creates expiring links with random IDs. |
| 8 | Choose 1 hour, 24 hours, or 7 days. |
| 10 | Lets the creator revoke an expiring link before it expires. |
| 8 | Exports every saved question as a CSV backup. |
| 6 | Downloads dated answer copies as JSON. |
| 8 | Hides the owner, source, and note by default. |
| 10 | Accepts approved HTTPS links and never asks for dashboard credentials. |
| 11 | It does not ingest telemetry, create queries, or alert on systems. |
| 7 | Requirements: Node.js 20 or newer and npm. |
| 6 | The direct demo URL is `http://localhost:5173/?demo=1`. |
| 15 | `npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. |
| 10 | Static output lands in `dist/`, with `dist/index.html` at its root. |
| 14 | After one online visit, the app caches the files it needs to reopen offline. |
| 10 | Creating or opening an expiring link still needs a connection. |
| 8 | Use Download CSV template for a starter file. |
| 11 | Use Export question book CSV to back up every saved card. |
| 6 | `comparison` accepts `gte`, `lte`, or `eq`. |
| 5 | `observedAt` accepts an ISO date. |
| 5 | Source URLs must use HTTPS. |
| 10 | `freshMinutes` must be a whole number from 1 through 10,080. |
| 4 | Real questions use `tqb:v1`. |
| 4 | Demo questions use `demo:tqb:v1`. |
| 9 | The browser stores real and demo answer previews separately. |
| 6 | Preview data never enters the URL. |
| 13 | Creating an expiring link sends the reviewed copy to this site’s sharing service. |
| 9 | The link contains a random ID, not the answer. |
| 9 | The service checks expiry and revocation on every read. |
| 6 | Demo link IDs start with `d_`. |
| 8 | Reset demo and Start for real revoke them. |
| 11 | The reviewed answer is stored separately until its chosen expiry time. |
| 13 | Azure Storage removes it automatically at expiry, even when nobody opens the link. |
| 16 | The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. |
| 6 | Revocation deletes the reviewed answer immediately. |
| 8 | The sharing service groups requests by network address. |
| 12 | Each address can create, open, or revoke 100 links in 60 seconds. |
| 8 | The 101st request returns HTTP `429` with `Retry-After`. |
| 7 | Health checks do not use this limit. |
| 9 | Downloaded files do not expire or provide access control. |
| 6 | Do not put secrets in them. |
| 8 | The app has no account service or analytics. |
| 9 | This release is free and has no purchase flow. |
| 6 | Deploy from a clean, committed checkout: |
| 10 | The command builds `dist/` and the server functions in `api/`. |
| 10 | It stamps `dist/build-info.json` and sets `BUILD_ID` to the same commit. |
| 14 | After deployment, it confirms that both the static marker and `/api/health` report that commit. |
| 12 | It also confirms that forged network-address headers cannot bypass the 100-request limit. |
| 14 | The deployed app needs a secret `SnapshotStorage` setting for its approved Azure Storage account. |
| 8 | The connection needs Table and Queue service access. |
| 4 | Never commit its value. |
| 14 | Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. |
| 9 | The command migrates active answers and removes expired ones. |
| 16 | `public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. |
| 8 | Azure Static Web Apps reads it during deployment. |
| 2 | MIT licensed. |
| 2 | See LICENSE. |

README headings, commands, the CSV header row, and project-note link labels are
not prose sentences. They were checked and need no rewrite. Every claim-like
sentence above maps to a `claims.json` entry; setup instructions and literal
commands are operational documentation rather than product claims.

## Demo, privacy, and claims

- The landing action opened `/demo` in one click. The first phone viewport
  showed a named Northstar question, `1,842 orders`, “On track,” and “Fresh for
  60 min”; all three realistic sample cards were loaded.
- The persistent banner reads “Demo — sample data, nothing is saved.” A demo
  answer link used a `d_` ID, returned 200 before Reset, then 410 after Reset.
  Demo storage was `demo:tqb:v1`; real keys were neither read nor changed.
- A fresh live request log during landing, demo, update, share, reset, and
  navigation contained only `https://telemetry-question-book.sociobot.in`.
  No analytics, font CDN, dashboard, account, model, payment, or other origin
  appeared. The explicit share request stayed same-origin.
- From the clean `npm ci` install, `npm test` passed: all 15 API tests and all
  33 Playwright tests, including each of the 28 uniquely tagged manifest
  claims. The six API manifest commands were also run at their exact declared
  `--test-name-pattern` values and passed. No claim test failed or was absent.
- `npm run build` passed and produced `dist/`. No AI feature is missing: the
  brief prohibits generated explanations, and CSV import/export plus expiring
  sharing cover the implied workflow without adding a decorative model call.

## History, structure, and accessibility

Every finding in reviews 1–6, every `polish-*.md`, and the previous handoff was
read and checked against the current code and live deployment. F-1-1 through
F-5-1 remain fixed: demo first-fold content and isolation, expiring redacted
links, complete claim assertions, CSV round trip, accurate privacy/offline
copy, distinct source titles, non-generic 404, mobile focus behavior, and
plain terminology all rechecked successfully. F-1-6's formerly incomplete
tagged assertions now include both demo exits, exact CSV/template boundaries,
preview isolation, and exact downloaded fields.

All internal landing links, legal routes, three source routes, and the external
Param Factory link returned 200; the designed unknown route returned HTTP 404.
Each app route has a route-specific title, one h1, meta description, canonical,
Open Graph/Twitter image, favicon, and shared footer. `robots.txt` and the
sitemap list the intended routes. Browser back from Demo restored the root and
focused its h1; forward navigation focused Demo's h1. Root and 404 Axe scans
had zero violations. The 404's expected HTTP network diagnostic is not an app
console failure. The cream, forest-green, amber, paper-ticket instrument panel
and original art are distinct from a generic SaaS template.

F-7-1 is the only remaining structure failure.

## What would make this perfect

Keep the product name visible in the 390 px header and add the stated visual
wordmark regression. Then rerun this full cold-read, copy, demo, claims,
history, routing, privacy, and accessibility checklist. A PASS requires that
single remaining finding to be gone as well.
