# Telemetry Question Book

Track recurring answers from approved readings. This browser-based app is for engineering and support pairs who cannot share broad dashboard access.

Enter a reading or import an approved CSV. The app does not query dashboards. The free question book keeps each owner, freshness limit, threshold, and HTTPS source link. Saved questions reopen offline after one online visit.

Try the isolated sample at `/demo`, `/?demo=1`, or <https://telemetry-question-book.sociobot.in/demo>. Demo changes use `demo:` storage keys and never read or change the real question book.

## What it does

- Saves approved question cards in the browser.
- Updates a recurring reading without making a duplicate card.
- Imports new CSV rows and updates matching question names.
- Marks readings as on track, needs attention, or stale.
- Creates expiring links with random IDs. Choose 1 hour, 24 hours, or 7 days.
- Lets the creator revoke an expiring link before it expires.
- Exports every saved question as a CSV backup.
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

Use **Download CSV template** for a starter file. Use **Export question book CSV** to back up every saved card. Required columns are:

```text
question,owner,source,sourceUrl,value,unit,threshold,comparison,observedAt,freshMinutes,note
```

`comparison` accepts `gte`, `lte`, or `eq`. `observedAt` accepts an ISO date. Source URLs must use HTTPS. `freshMinutes` must be a whole number from 1 through 10,080.

## Data and sharing

Real questions use `tqb:v1`. Demo questions use `demo:tqb:v1`. The browser stores real and demo answer previews separately. Preview data never enters the URL.

Creating an expiring link sends the reviewed copy to this site’s sharing service. The link contains a random ID, not the answer. The service checks expiry and revocation on every read. Demo link IDs start with `d_`. **Reset demo** and **Start for real** revoke them.

The reviewed answer is stored separately until its chosen expiry time. Azure Storage removes it automatically at expiry, even when nobody opens the link. The service keeps only the link ID, expiry time, demo status, and a one-way revocation code. Revocation deletes the reviewed answer immediately.

The sharing service groups requests by network address. Each address can create, open, or revoke 100 links in 60 seconds. The 101st request returns HTTP `429` with `Retry-After`. Health checks do not use this limit.

Downloaded files do not expire or provide access control. Do not put secrets in them. The app has no account service or analytics. See `/privacy` and `/terms`.

## Pricing

This release is free and has no purchase flow.

## Deployment

Deploy from a clean, committed checkout:

```bash
npm run deploy
```

The command builds `dist/` and the server functions in `api/`. It sets `BUILD_ID` to the commit being deployed. After deployment, it confirms that `/api/health` reports that commit. It also confirms that forged network-address headers cannot bypass the 100-request limit.

The deployed app needs a secret `SnapshotStorage` setting for its approved Azure Storage account. The connection needs Table and Queue service access. Never commit its value.

Run `npm --prefix api run cleanup:legacy` only when upgrading storage created before version 1.2.0. The command migrates active answers and removes expired ones.

`public/staticwebapp.config.json` routes app pages, serves the styled 404, sets cache rules, and adds browser security protections. Azure Static Web Apps reads it during deployment.

## Project notes

- [Visual system](.factory/design.md)
- [Verified claims](.factory/claims.json)
- [Demo contract](.factory/demo.md)
- [Build handoff](.factory/handoff.md)

MIT licensed. See [LICENSE](LICENSE).
