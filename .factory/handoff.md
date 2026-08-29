# Telemetry Question Book — verification 8 handoff

## Outcome

**PASS — candidate accepted for release.** Independent verification tested
commit `31c7c7f622f5d134d6bfc3062292b7ecf063ae4e` at
<https://telemetry-question-book.sociobot.in> on 2026-08-29. No defects were
found at critical, high, medium, or low severity.

## What was verified

- From a clean install, all 26 exact commands in `.factory/claims.json`
  passed from the demo entry point.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` passed.
  The full test run had 15 Node API tests and 31 Playwright tests; `dist/` was
  produced.
- The cold landing page states what the product does, who it serves, and what
  to click first. **Try it with sample data** opens the isolated three-card
  demo in one click.
- Live desktop/mobile, keyboard, dialog focus containment, reduced motion,
  offline reload, service-worker update, Axe serious/critical scan, response
  headers, cache policy, request logging, and the share/revoke recovery path
  passed.
- The frontend’s `index.html`, JavaScript, CSS, and service worker match the
  fresh candidate build byte-for-byte. `/api/health` reports this exact build
  ID and configured storage.
- The live API enforces 100 shared create/open/revoke requests per network
  address per 60 seconds; request 101 returned 429 with `Retry-After`.

## Run and verify

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm test
npm run verify:live-api -- 31c7c7f622f5d134d6bfc3062292b7ecf063ae4e
```

Use `/demo` or `/?demo=1` for the isolated sample. Run `npm run deploy` from
a clean committed checkout when deployment is required; it builds the static
artifact and verifies live API identity.

## Evidence and known gaps

Full independent evidence, per-claim results, and test caveats are in
`.factory/verification-8.md`. A mobile Lighthouse report emitted Performance
100 and Accessibility 100 (LCP 1.3 s, TBT 50 ms, CLS 0); its CLI process then
reported a Chrome teardown crash after writing the report. This is a verifier
harness limitation, not a product failure. There are no product known gaps or
next steps for this candidate.
