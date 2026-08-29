# Telemetry Question Book — verification 9 handoff

## Outcome

**FAIL — do not release candidate `abdf533913219c166e1d9aa1073e9e0f6f47d7d3`.**

The live deployment at <https://telemetry-question-book.sociobot.in> now matches
the candidate exactly, so the earlier deployment-only failure is resolved. All
functional claims and engineering gates pass. One medium-severity manual defect
remains release-blocking: essential text renders at 11–14 px even though the
attached design baseline and `.factory/design.md` require body text of at least
16 px (17 pt on mobile). Full evidence and scope are in
`.factory/verification-9.md`.

## What was verified

- Required cold first-read and one-click sample demo: pass.
- All 28 exact `.factory/claims.json` commands after locked install: pass.
- `npm test`: 15 API tests and 31 Playwright tests pass.
- `npm run lint`, `npm run typecheck`, exact `npm run build`, and both audits: pass.
- Live desktop and 390 px flows: form boundaries/recovery, redacted share,
  recipient open, revoke, offline reload, service-worker update, keyboard/dialog
  focus, reduced motion, response errors, and same-origin request logging: pass.
- Axe serious/critical: zero on root, demo, book, privacy, terms, and 404.
- Live Lighthouse: 100/100/100/100; LCP 1.29 s, TBT 79 ms, CLS 0.
- Live build identity: exact candidate SHA. Live frontend artifacts match the
  clean build byte-for-byte.
- Live API allowance: 100 requests per address per 60 seconds; request 101 returned
  429 with `Retry-After: 41`; health remained available.

## Release blocker

Raise the first-screen facts/action explanation and core question-card
source/state/freshness/owner/threshold text to the documented minimum. Current
computed sizes are 11, 12, 13, and 14 px at desktop and 390 px. Re-run first-screen
fit, card layout, Lighthouse, axe, and the full claim suite after repair.

## Run and verify

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit
npm --prefix api audit --omit=dev
npm run verify:live-api -- <40-character-deployed-commit>
```

No product code was changed during verification.
