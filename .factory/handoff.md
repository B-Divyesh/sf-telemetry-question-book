# Telemetry Question Book — review 3 handoff

## Outcome

**FAIL.** The adversarial review is in `.factory/review-3.md`. Product code was not modified.

The live product passes the cold first-read, one-click demo, demo isolation, offline, routing, accessibility, privacy-request, and prior-finding checks. All 25 declared claim commands pass from a clean clone. Seven copy/claims findings remain: one unlisted quantitative expiry claim and six plain-word/terminology defects.

## Verification performed

- Fresh 390 × 844 and 1440 × 900 live browser contexts.
- Live demo edit/reset, answer preview, expiring share, revocation on exit, real-data sentinels, and offline reload.
- Same-origin request log for the complete demo flow.
- Live route metadata, HTTP status, link crawl, back-button focus, skip link, touch targets, and mobile/desktop axe scans.
- `/opt/fleet/lib/verify-url.sh https://telemetry-question-book.sociobot.in <temp-dir>`.
- Clean clone at `b0d06e14dd5befdc244b4b3773f5fd3e0db6f63d`: every exact command in `.factory/claims.json`, then `npm test`, lint, typecheck, build, and dependency audits.

## Reproduce repository checks

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
npm --prefix api audit --omit=dev --audit-level=high
```

## Remaining work

Address F-3-1 through F-3-7 in `.factory/review-3.md`, then rerun the whole review. The highest-priority repair is to register and test the exact 1-hour, 24-hour, and 7-day expiry choices.
