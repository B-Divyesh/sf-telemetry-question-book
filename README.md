# Telemetry Question Book

Answer recurring telemetry questions from approved readings. This local-first web app is for engineering and support pairs who cannot share raw Grafana, Kibana, or log access.

The free book stores named questions with owners, freshness limits, thresholds, and HTTPS source links. It updates recurring readings, imports approved CSV rows, and exports answer copies with optional redaction. It works after the first visit, even offline.

Try the isolated sample at `/demo` or `https://telemetry-question-book.sociobot.in/demo`. Demo changes use a separate storage key and never touch the real book.

## What it does

- Saves approved question cards in the browser.
- Updates a recurring reading without making a duplicate card.
- Imports new CSV rows and updates matching question names.
- Marks readings as on track, needs attention, or stale.
- Downloads point-in-time answer copies as JSON.
- Hides the owner, source, and note by default.
- Accepts approved HTTPS links and never asks for dashboard credentials.

It does not ingest telemetry, create queries, or alert on systems.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The direct demo URL is `http://localhost:5173/demo`.

## Test and build

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` builds the production app and runs the Playwright claim and accessibility suite. The exact deploy command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

The production service worker caches the visited shell. The test suite proves the demo reloads after the browser goes offline.

## CSV format

Use the **Download CSV template** action in the book. Required columns are:

```text
question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note
```

`comparison` accepts `gte`, `lte`, or `eq`. `observedAt` accepts an ISO date. Source URLs must use HTTPS. `freshMinutes` must be a whole number from 1 through 10,080.

## Data and sharing

Real questions use the browser key `tqb:v1`. Demo questions use `demo:tqb:v1`. Answer-copy previews use session storage and never enter the URL. Downloaded files do not expire or provide access control, so do not put secrets in them.

The app has no account service or analytics. See the in-app `/privacy` and `/terms` pages.

## Pricing

This release is free and has no purchase flow. The researched brief proposed a one-time Support Pack, but its checkout was not registered. The product does not advertise unavailable paid features.

## Deployment

Deploy `dist/` as a static site. `public/staticwebapp.config.json` provides the SPA fallback, 404 behavior, cache rules, and security headers for Azure Static Web Apps.

## Project notes

- [Visual system](.factory/design.md)
- [Verified claims](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Build handoff](.factory/handoff.md)

MIT licensed. See [LICENSE](LICENSE).
