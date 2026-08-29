# Telemetry Question Book — polish 6 handoff

## Outcome

**PASS.** F-1-6 is fully closed. The application behavior was already correct,
but five claim tests were too shallow. They now prove both demo exit paths,
the complete freshness boundary, the exact CSV template, preview storage
separation, and the exact downloaded answer object. All findings from reviews
1–6 were rechecked; no known issue remains.

The product stays a Vite + TypeScript static web app with managed Static Web
App functions. Its cream, forest, amber, hard-edged instrument-panel identity
is unchanged.

## Changes

- `@claim:demo-controls` now creates a `d_` link before **Reset demo**, proves
  HTTP 410 after reset, verifies that only the freshly seeded sample key
  remains, and compares exact real sentinels. It repeats revocation, full demo
  cleanup, and real-data comparison for **Start for real**.
- `@claim:csv-validation` now successfully imports and inspects `freshMinutes`
  10,080 in addition to the existing 1, 0, 1.5, and 10,081 cases.
- `@claim:csv-template` compares the complete header and every field of the
  one sample row exactly.
- `@claim:answer-copy-security` pre-seeds a real preview and proves the demo
  preview leaves it byte-for-byte unchanged.
- `@claim:answer-copy-download` compares the exact key set and complete file
  with the reviewed preview, including answer, status, observed time, and
  created time.
- `.factory/claims.json` documents those exact sandboxes.
- The catalog description is now the verb-first, 76-character line: “Track
  recurring telemetry answers from readings your team enters or imports.”

## Verification

- Fresh clone `/tmp/tqb-polish6-clean` at repair commit `296c06d`:
  **28/28 literal claim commands passed**.
- `npm test`: **15 API tests and 33 Playwright tests passed**.
- `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check`,
  root full/production audits, and API production audit: PASS, zero
  vulnerabilities.
- Build output: JS 36,457 bytes raw / 11.89 kB gzip; CSS 17,192 bytes raw /
  4.88 kB gzip; mobile hero 42,650 bytes. `dist/index.html` exists.
- Local and live browser matrix at 1440 × 900 and 390 × 844: all valid routes
  have the correct title, `lang=en`, one h1/main, image alternatives, no
  overflow, no unexpected console/page errors, no sub-16 px visible text, no
  undersized targets, and zero serious/critical Axe findings.
- Keyboard checks: visible skip-link and primary-action focus, route h1 focus,
  forward/reverse dialog containment, Escape focus restoration, and reduced
  motion all pass.
- Cold production flow: first-screen facts fit; one-click `/demo` and
  `?demo=1` show the first reading; Reset and Start preserve real sentinels;
  1-hour/24-hour/7-day links use `d_` IDs and revoke to 410; offline reload
  retains three cards; every audited route/title passes; unknown paths return
  the designed HTTP 404. All observed requests stay on the product origin.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo` with no errors.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.910 s, LCP 1.210 s, TBT 0 ms, CLS 0, 61,697 bytes transferred.
- Deployment verification requires `/build-info.json` and `/api/health` to
  match the exact committed build, then confirms forged network-address
  headers cannot bypass the 100-request limit.

Evidence is indexed in `.factory/polish-6.md`. The concise clean record is
`.factory/evidence/polish-6/clean-verification.txt`; live browser evidence is
under `.factory/evidence/polish-6/live/`.

## Run and deploy

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
npm run deploy
```

`npm run deploy` requires a clean committed checkout. It builds `dist/`, sets
the API build ID, uploads the static site and functions, and verifies live
static/API identity plus the forged-header rate-limit boundary.

## Known gaps and next steps

None. Generated explanations remain intentionally absent because the brief
prohibits them. No infrastructure, DNS, billing, or paid provider was changed.
