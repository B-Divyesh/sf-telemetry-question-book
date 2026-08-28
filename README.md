# Telemetry Question Book

Answer recurring telemetry questions from approved readings. This local-first web app is for engineering and support pairs who cannot share raw Grafana, Kibana, or log access.

The free book stores named questions with owners, freshness limits, thresholds, and HTTPS source links. It imports approved CSV rows and creates expiring answer snapshots with optional redaction. It works after the first visit, even offline.

Try the isolated sample at `/demo` or `https://telemetry-question-book.sociobot.in/demo`. Demo changes use a separate storage key and never touch the real book.

## What it does

- Saves approved question cards in the browser.
- Imports question rows from the included CSV format.
- Marks readings as on track, needs attention, or stale.
- Creates answer snapshot links with 24-hour, 3-day, or 7-day expiry.
- Hides the owner, source, and note when redaction is selected.
- Accepts approved HTTPS links and never asks for dashboard credentials.

It does not ingest telemetry, create queries, or alert on systems.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The direct demo URL is `http://localhost:5173/demo`.

## Test and build

```bash
npm test
npm run build
```

`npm test` builds the production app and runs the Playwright claim and accessibility suite. The exact deploy command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

The production service worker caches the visited shell. The test suite proves the demo reloads after the browser goes offline.

## CSV format

Use the **Download CSV template** action in the book. Required columns are:

```text
question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note
```

`comparison` accepts `gte`, `lte`, or `eq`. `observedAt` accepts an ISO date. Source URLs must use HTTPS.

## Data and sharing

Real questions use the browser key `tqb:v1`. Demo questions use `demo:tqb:v1`. Snapshot contents live inside the shared URL and are readable by anyone who receives it until expiry. Review each snapshot before sharing it.

The app has no account service or analytics. License verification sends only the pasted license token to `api.sociobot.in`. See the in-app `/privacy` and `/terms` pages.

## Support Pack

The optional Support Pack costs $49 once. A verified Sociobot license downloads maintained Grafana, Kibana, and CSV connector recipes plus starter question templates. The free book, CSV import, snapshots, and safety controls stay available.

The factory registers the product with Sociobot billing. This repository uses the slug-based checkout and verification contract and contains no payment provider credentials.

## Deployment

Deploy `dist/` as a static site. `public/staticwebapp.config.json` provides the SPA fallback, 404 behavior, cache rules, and security headers for Azure Static Web Apps.

## Project notes

- [Visual system](.factory/design.md)
- [Verified claims](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Build handoff](.factory/handoff.md)

MIT licensed. See [LICENSE](LICENSE).
