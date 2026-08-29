# Telemetry Question Book

Track recurring answers from approved readings. This browser-based app is for engineering and support pairs who cannot share broad dashboard access.

Enter a reading or import an approved CSV. The app does not query dashboards. The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. It works after the first visit, even offline.

Try the isolated sample at `/demo`, `/?demo=1`, or <https://telemetry-question-book.sociobot.in/demo>. Demo changes use `demo:` storage keys and never read or change the real question book.

## What it does

- Saves approved question cards in the browser.
- Updates a recurring reading without making a duplicate card.
- Imports new CSV rows and updates matching question names.
- Marks readings as on track, needs attention, or stale.
- Creates opaque answer links that expire after 1 hour, 24 hours, or 7 days.
- Lets the creator revoke an answer link before it expires.
- Downloads dated answer copies as JSON.
- Hides the owner, source, and note by default.
- Accepts approved HTTPS links and never asks for dashboard credentials.

It does not ingest telemetry, create queries, or alert on systems.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The direct demo URL is `http://localhost:5173/?demo=1`.

## Test and build

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` builds the app and runs the Playwright claims, browser, offline, and accessibility suite. Static output lands in `dist/`, with `dist/index.html` at its root.

After one online visit, the app caches the files it needs to reopen offline. Creating or opening an expiring link still needs a connection.

## CSV format

Use **Download CSV template** in the question book. Required columns are:

```text
question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note
```

`comparison` accepts `gte`, `lte`, or `eq`. `observedAt` accepts an ISO date. Source URLs must use HTTPS. `freshMinutes` must be a whole number from 1 through 10,080.

## Data and sharing

Real questions use `tqb:v1`. Demo questions use `demo:tqb:v1`. Real and demo answer previews use separate session-storage keys. Preview data never enters the URL.

Creating an expiring link sends the reviewed copy to the first-party snapshot API. The URL holds only an opaque token. The service checks expiry and revocation on every read. Demo links use a separate token prefix and are revoked when the demo resets or closes.

Downloaded files do not expire or provide access control. Do not put secrets in them. The app has no account service or analytics. See `/privacy` and `/terms`.

## Pricing

This release is free and has no purchase flow.

## Deployment

Run `npm run build`, then deploy `dist/` with the managed functions in `api/`:

```bash
/opt/fleet/lib/deploy-static.sh telemetry-question-book dist
```

`public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. Azure Static Web Apps reads it during deployment.

## Project notes

- [Visual system](.factory/design.md)
- [Verified claims](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Build handoff](.factory/handoff.md)

MIT licensed. See [LICENSE](LICENSE).
