# Telemetry Question Book — verification 14 handoff

## Outcome

**PASS** for candidate `22cb671252954e59ac26369452f6a29b2e4bb53a` at
`https://telemetry-question-book.sociobot.in`.

Independent verification confirms matching live static/API build IDs, a
plain-language first screen with a one-click sample-data demo, and all release
gates passing. The exact evidence and the only low-severity observation are in
[verification-14.md](verification-14.md). This report supersedes the older
polish-7 conclusion below, which remains as historical repair context.

The functional repair is commit
`91e44ba21a75dbda1d8a329cec870fbdb3a042b4`. The first evidence-bearing live
deployment is `178f1351b27609a5ac6d1403ba5c03e023b2550b`. The final
documentation-only deployment repeats the repository's static/API identity
check.

## What changed

- Kept the full wordmark visible beside the instrument dial at 390 px.
- Uses the compact visible label “Questions” for the mobile `/book` link while
  retaining its accessible name “My question book.”
- Stacks wordmark and navigation below 350 px to avoid overlap.
- Added a regression across six app routes at 390 px and 320 px that checks
  visible product text, viewport bounds, and non-overlap.
- Updated the catalog sentence to 93 characters, verb first.
- Extended the reusable browser matrix to record and assert visible phone
  wordmarks on app and 404 routes.

## Verification

- Clean clone: all 28 literal commands in `.factory/claims.json` passed.
- Full suite: 15 API tests and 34 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`, and
  root/production/API high-severity audits passed.
- Build output: 36,612-byte JS (11,882 gzip) and 17,547-byte CSS (4,954 gzip),
  well below the static-product budgets.
- Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.425 s, TBT 45 ms, CLS 0.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.211 s, TBT 0 ms, CLS 0.
- Local and live route matrices each covered 16 route/viewport combinations:
  zero serious/critical Axe findings, valid-route console/page errors,
  horizontal overflows, or undersized controls.
- The live cold flow verified one-click `?demo=1`, the persistent banner,
  real-data sentinels, Reset/Start cleanup, 1-hour/24-hour/7-day links,
  revocation, offline reopen, route titles, legal pages, and HTTP 404.
- The deployment check matched `/build-info.json` and `/api/health`, confirmed
  snapshot storage, and proved forged address headers cannot bypass the shared
  request limit.

Evidence is indexed in [.factory/polish-7.md](polish-7.md). The complete clean
run is [clean-verification.txt](evidence/polish-7/clean-verification.txt), the
live cold result is
[cold-browser-check.json](evidence/polish-7/live/browser/cold-browser-check.json),
and the live phone capture is
[screenshot-mobile.png](evidence/polish-7/live/root/screenshot-mobile.png).

## Run and deploy

```bash
npm ci
npm test
npm run lint
npm run build
npm run deploy
```

`npm run deploy` requires a clean committed checkout. It builds `dist/`, deploys
the server functions in `api/`, and verifies the committed build identity and
live rate-limit behavior.

## Known gaps and next steps

No release-blocking gaps. At mobile widths the demo intentionally hides **Add a
question**, although the real workspace retains it; see
[verification-14.md](verification-14.md) for the verified scope and suggested
follow-up. No AI feature was added because the brief explicitly prohibits
generated explanations; CSV import/export and expiring links already complete
the job.
