# Telemetry Question Book — review 5 handoff

## Outcome

Review 5 is **FAIL** with one minor finding: landing heading F-5-1, “It
translates readings. It does not replace telemetry.”, does not name its limits
section when read out of context. Product code was not changed.

## What was verified

- Fresh phone and desktop visits explain the job, audience, and first action.
- The one-click demo shows realistic data, a persistent demo banner, isolated
  `demo:` storage, working reset, and unchanged real sentinels.
- All 28 exact `.factory/claims.json` commands passed independently from
  `/tmp/tqb-review-5` after a clean install.
- Full suite passed: 15 API tests and 32 Playwright tests. Lint, typecheck,
  build, and both dependency audits passed.
- Live route, metadata, link, focus/back, accessibility, privacy-request,
  sitemap, robots, 404, and visual-identity checks passed.
- All earlier findings were independently confirmed fixed except the new F-5-1
  copy finding.

## How to verify

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
```

For the live demo, open `https://telemetry-question-book.sociobot.in/demo` at
390 px width and confirm the Northstar sample, banner, Reset demo, and Start
for real controls.

## Known gap and next step

Replace the limits h2 with “What the question book does not do” and remove the
duplicate eyebrow. Then repeat the complete review from fresh browser contexts
and a clean clone.
