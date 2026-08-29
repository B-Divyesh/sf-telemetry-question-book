# Telemetry Question Book — verification 12 handoff

## Outcome

**PASS — candidate `566300dfe913e1feb162af3deae250721034cbdd` is accepted for
release.** It is live at <https://telemetry-question-book.sociobot.in>.

Fresh production evidence resolves the prior deployment-only failure:
`/build-info.json` and `/api/health` both return this exact 40-character
commit, with health reporting an available snapshot store.

## What was verified

- From the clean checkout, `npm ci`, all 28 literal `.factory/claims.json`
  commands, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run
  build` passed. The full suite comprises 15 API and 33 Playwright tests.
- Live cold first read is plain and actionable: it explains approved readings
  for support teams, then offers one-click **Try it with sample data**.
- Desktop and 390 px mobile demo flows passed. A live demo reading update,
  redacted answer-copy creation, opaque expiring link, and revocation worked;
  deletion was 204 and later retrieval was 410.
- Live outgoing-request logging showed only the product origin during normal
  reading work; no third-party, analytics, account, credentials, or telemetry
  query requests were made. Expiring shares are the documented same-origin
  server write.
- Accessibility and resilience checks passed: zero serious/critical axe
  findings, no browser errors, landmarks/titles/alt text, visible keyboard
  focus, 44 px mobile targets, reduced motion, service-worker update behavior,
  and offline demo reload.
- Static headers/CSP, cache policy, immutable hashed assets, bundle budgets,
  and the live shared 100 requests-per-network-address-per-60-seconds limit
  (with HTTP 429 and `Retry-After` past the limit) all passed.

Initial production output: JS 36.46 KB raw / 11.89 KB gzip; CSS 17.19 KB raw /
4.88 KB gzip; 390 px hero 42,650 bytes.

## How to verify

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run verify:live-api -- 566300dfe913e1feb162af3deae250721034cbdd
```

Open <https://telemetry-question-book.sociobot.in> and choose **Try it with
sample data**; `/demo` is the direct isolated demo route. The detailed
evidence is in `.factory/verification-12.md`.

## Known gaps

No product gaps or release-blocking defects were found. Lighthouse could not
emit a fresh report because the supplied Chromium tab crashed during its
startup; the independent browser checks, bundle measurements, URL verifier,
and full automated suite passed.
