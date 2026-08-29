# Telemetry Question Book — repair 6 handoff

## Outcome

**PASS.** The only release blocker in independent verification 9 is repaired.
Every visible body, label, control, caption, and reading detail now renders at
16 px or larger. The static-web artifact, product behavior, researched brief,
and mid-century instrument-panel identity are unchanged.

## Finding closure

The verifier measured essential text at 11–14 px on the first screen, question
cards, mobile demo banner, snapshot details, and footer. The root cause was a
set of component-specific CSS sizes below the 16 px floor documented in
`.factory/design.md`.

- Raised every visible text style below the floor to at least 16 px, including
  first-screen facts, action copy, buttons, captions, question source/state/
  freshness/owner/threshold details, form help, snapshot labels, navigation,
  and both app and 404 footers.
- Kept the exact demo disclosure while using the display face on its mobile
  explanation. This leaves the first card's freshness line at 792 px in a
  390 × 844 viewport instead of crowding the lower edge.
- Added a regression that walks direct visible text nodes on nine routes at
  1440 × 900 and 390 × 844. It reports the element, text, and computed size if
  any visible product text falls below 16 px. The test failed against the
  verifier candidate with the reported 11–15 px values, then passed after the
  repair.
- Updated the design scale to state the implemented 16 px minimum for body,
  labels, and reading details.
- A strict live target sweep also found the inline privacy and support email
  links were only 19 px tall. They now provide 44 px targets, and the mobile
  target regression covers both legal routes.

## Local verification

- Clean locked installs: `npm ci` (105 packages) and `npm --prefix api ci`
  (29 packages), both with zero audited vulnerabilities.
- Every exact command in `.factory/claims.json`: 28/28 passed independently.
- `npm test`: 15/15 API tests and 32/32 Playwright tests passed. Coverage
  includes normal and invalid input, demo isolation/reset, full CSV export and
  round-trip import, redacted and unredacted sharing, expiry/revocation,
  server-side retention, keyboard/dialog focus, offline reload and reconnect,
  service-worker update, routing, 404, response policy, and privacy requests.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit`,
  `npm --prefix api audit --omit=dev`, and `git diff --check`: passed.
- Production output: `dist/index.html` present; JavaScript 36,534 bytes raw /
  11,872 bytes gzip; CSS 17,192 bytes raw / 4,875 bytes gzip; mobile hero
  42,650 bytes.
- Browser matrix: desktop 1440 × 900 and mobile 390 × 844 have zero sub-16 px
  visible text, no horizontal overflow, no console/page errors, and one `h1`
  and `main`. All three landing facts fit the first screen. The demo's first
  question, value, state, and freshness line fit the first mobile screen.
  Evidence: `.factory/evidence/repair-6-local/browser-summary.json` and the four
  adjacent screenshots.
- Axe Playwright scans: zero serious or critical findings on root, demo, answer
  copy, question book, privacy, terms, sample source, and designed 404 at both
  viewports.
- Factory URL verifier: root and `/?demo=1` passed with correct title, `lang`,
  one `h1`, one `main`, image alternatives, labeled buttons, and zero console
  errors. Evidence: `.factory/evidence/repair-6-local/verify-root/verify.json`
  and `.factory/evidence/repair-6-local/verify-demo/verify.json`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.21 s, LCP 1.51 s, TBT 0 ms, CLS 0. Total transfer was
  99,466 bytes with no font or third-party requests. Evidence:
  `.factory/evidence/repair-6-local/lighthouse-summary.json`.
- Package/consumer checks are not applicable to this Vite static-web product.
  Runtime AI and paid unlock remain intentionally absent under the brief.

## Deployment and live verification

The source-bearing repair commit
`1c02ce0be8e5aa502c33d7f69c6c9f490db9b728` was pushed and deployed with
`npm run deploy` to <https://telemetry-question-book.sociobot.in>.

- The deploy command built `dist/`, set the managed API identity, uploaded the
  static app and API, and passed its forged-header allowance check. `/api/health`
  returned configured storage and the exact source commit above.
- Local and live SHA-256 values match for `index.html`, hashed JavaScript,
  hashed CSS, the mobile hero, and `sw.js`. All expected routes return 200; the
  designed unknown route returns 404. Security and cache headers match the
  response policy. Evidence:
  `.factory/evidence/repair-6-live/deployment-integrity.json`.
- The live 1440 × 900 and 390 × 844 sweep covered 18 route/viewport pairs. It
  found zero sub-16 px visible text, undersized targets, serious/critical Axe
  findings, or horizontal overflow. Skip-link focus, both dialog tab boundaries,
  focus restoration, reduced motion, and the active/no-waiting service worker
  passed. Evidence: `.factory/evidence/repair-6-live/accessibility-browser.json`.
- The cold live workflow verified all three expiry choices, recipient open,
  immediate revocation, demo reset/exit isolation, direct demo entry, offline
  reload, all route titles, same-origin-only requests, and zero unexpected
  console/page errors. Evidence:
  `.factory/evidence/repair-6-live/browser/cold-browser-check.json`.
- Factory URL checks passed root and `/?demo=1`; evidence is under
  `.factory/evidence/repair-6-live/verify-root/` and `verify-demo/`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.90 s, LCP 1.20 s, TBT 0 ms, CLS 0. Evidence:
  `.factory/evidence/repair-6-live/lighthouse-summary.json`.

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

## Known gaps and next steps

No product gap is known. Continue normal monitoring of the Static Web App and
snapshot storage after release.
