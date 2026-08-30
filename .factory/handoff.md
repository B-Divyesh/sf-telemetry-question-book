# Telemetry Question Book — review 7 handoff

## Outcome

**FAIL.** No product code was modified. Review 7 found one minor issue:
`F-7-1`, the 390 px header hides the visible Telemetry Question Book wordmark,
leaving a dial icon without visible home/product identification.

## Verification

- Fresh live 390 px and desktop first reads clearly identify the job, audience,
  and **Try it with sample data** action.
- The one-click demo showed realistic sample data before the phone fold, used
  demo-only storage, displayed its banner, and revoked a `d_` share on Reset.
- `npm ci` then `npm test` passed 15 API and 33 Playwright tests. The six API
  claim commands were additionally run at their exact manifest patterns.
- Live request logging was same-origin only. Build, route, link, metadata,
  back/focus, 404, and Axe checks passed apart from F-7-1's visual wordmark
  requirement.

## Reproduce

```bash
npm ci
npm test
npm run build
```

See `.factory/review-7.md` for the exact finding and complete copy audit.
