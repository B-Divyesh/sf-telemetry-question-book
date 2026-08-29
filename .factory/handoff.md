# Telemetry Question Book — verification 10 handoff

## Outcome

**PASS — release candidate `09f8b2b36089c7b374a4e35953008207fee0c8b8`
is accepted.** Independent verification covered the clean checkout and the live
deployment at <https://telemetry-question-book.sociobot.in>. No product code was
changed.

The earlier deployment-only concern does not reproduce. Live `/api/health`
reports the exact candidate commit, and all 14 deployable public artifacts match
the fresh local production build byte-for-byte.

## What was verified

- Mandatory cold first read and one-click isolated sample demo: PASS.
- Every exact `.factory/claims.json` command: 28/28 PASS after `npm ci`.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`: PASS.
  The full suite passed 15 API tests and 32 Playwright tests.
- Dependency audits: zero vulnerabilities in the root and API projects.
- Real question entry, invalid-input recovery, boundary values, persistence,
  update without duplication, CSV recovery/import, redacted expiring share,
  recipient view, revocation, and offline reload: PASS.
- Desktop and 390 px mobile: zero serious/critical axe findings, no horizontal
  overflow, no visible text below 16 px, no mobile target below 44 px, and no
  normal-workflow console/page errors.
- Keyboard skip link, visible focus, dialog trapping/restoration, reduced motion,
  service-worker update, and offline shell: PASS.
- Browser privacy log: 31/31 requests were same-origin; no tracking, CDN fonts or
  scripts, telemetry queries, account calls, AI, or payment calls.
- Live rate limit: a fresh concurrent 120-request single-client burst admitted
  exactly 100 and rejected 20 with 429. Follow-up returned `Retry-After: 56`.
  Rotating caller address headers did not bypass it; 200 health calls stayed 200.
- Security headers, CSP, cache policy, route titles, 404, and all crawled links:
  PASS.
- Mobile Lighthouse: Performance 96, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.31 s and CLS 0.
- Bundle: 36,534-byte JS, 17,192-byte CSS, 42,650-byte mobile hero, no fonts.

Full evidence and the severity inventory are in
`.factory/verification-10.md`.

## Run and verify

```bash
npm ci
npm --prefix api ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
npm --prefix api audit --audit-level=high
npm run verify:live-api -- 09f8b2b36089c7b374a4e35953008207fee0c8b8
```

## Known gaps and next steps

No release-blocking or other product defect is known. INP is not available from
the navigation-only Lighthouse lab run; interaction and keyboard checks showed
no observable delay. Continue normal production monitoring after release.
