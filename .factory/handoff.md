# Telemetry Question Book — repair 7 handoff

## Outcome

**Repaired the release-blocking deployment-identity failure.** Verification 11
showed that the candidate's static files matched production while
`/api/health` reported the older `bba743887ad538ac40c7901b8741b1eba95d6b9c`
build. The repair makes each production build publish a no-cache
`/build-info.json` marker containing its full Git commit. Deployment now builds
that marker with the same `BUILD_ID` used by the server functions, and the live
verifier requires both the static marker and `/api/health` to equal the exact
requested commit before it performs the rate-limit check.

This keeps the existing local-first question-book, demo, sharing, privacy, and
mid-century instrument-panel interface unchanged.

## Repair made

- `scripts/write-build-info.mjs` writes `dist/build-info.json` only when its
  full 40-character `BUILD_ID` equals the Git commit being built.
- `npm run build` creates that marker; `npm run deploy` supplies the exact
  commit ID to the build before updating the Static Web App setting and
  uploading `dist/` plus `api/`.
- `scripts/verify-live-api.mjs` now fails closed unless the static marker and
  server health response both name the requested commit. The marker is served
  with `Cache-Control: no-store`.
- The `@claim:deploy-integrity` regression starts a local live-like server. It
  proves matching static/API identities and the shared 100-request allowance
  pass, while a changed static marker fails. It also proves a mismatched build
  setting cannot write the static marker.

## Verification

- Clean install: `npm ci` and `npm --prefix api ci` completed with 0 reported
  vulnerabilities (the API install prints npm's deprecation notice for
  `@azure/storage-queue@12.28.0`).
- Quality gates: `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm test` all passed. The full suite had **15 API tests** and **33
  Playwright tests**. The production output is 36.46 KB raw / 11.89 KB gzip JS
  and 17.19 KB raw / 4.88 KB gzip CSS.
- Claims: all **28 literal commands** from `.factory/claims.json` passed from
  the installed checkout. The strengthened deployment claim is exercised by
  `npm run test:api -- --test-name-pattern @claim:deploy-integrity`.
- Browser/accessibility: the passing Playwright matrix covers landing, demo,
  question book, snapshot, privacy, terms, source, and 404 routes at 1440 ×
  900 and 390 × 844. It checks keyboard order/focus and dialog restoration,
  visible 16 px reading text, 44 px mobile controls, reduced motion, zero
  serious/critical axe findings, response policy, demo isolation, privacy
  requests, service-worker cache replacement, offline reload, and update
  state.
- Independent URL smoke check: `/opt/fleet/lib/verify-url.sh` passed local
  `/` and `/demo` with no console/page errors, one `h1`, a `main`, `lang=en`,
  zero missing image alternatives, and zero unlabeled buttons at both desktop
  and 390 px screenshots.
- Local desktop Lighthouse wrote a completed report with Performance **100**,
  Accessibility **100**, FCP **0.3 s**, LCP **0.4 s**, TBT **0 ms**, CLS **0**,
  and 124 KiB transferred. Chromium printed a target-close warning after the
  report had been written; the Playwright suite and URL smoke checks completed
  without a browser crash.
- Reproduction before deployment: the former candidate check failed as
  expected: production returned `buildId`
  `bba743887ad538ac40c7901b8741b1eba95d6b9c` and `/build-info.json` returned
  HTTP 404. That state can no longer satisfy `npm run verify:live-api`.

## Deploy and verify

Deploy only from a clean, committed checkout:

```bash
npm run deploy
```

The command builds `dist/` and `api/`, deploys them, then verifies that both
`/build-info.json` and `/api/health` contain the exact final 40-character HEAD
commit. It also checks that spoofed client headers cannot bypass the shared
100-request snapshot allowance. A non-zero deployment result is a release
blocker.

For local development:

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
```

## Known gaps

None. The brief prohibits generated explanations; no runtime AI feature is
present or needed for this local-first product.
