# Telemetry Question Book — polish 3 handoff

## Outcome

**PASS.** The release repair is deployed at <https://telemetry-question-book.sociobot.in>.

- Product repair commits: `916715af335b2310b2ad5c383a8cef65166c1a22` and `b9866c38726d4a2fd1090825d2d5b15ce5ef1e08`.
- Deployed work-order artifact: `b9866c3`; Azure Static Web Apps deployment `8c278234-a3d7-41e7-9968-107c23d6774f`.
- The only follow-up to the first deployed verification was a test-contract correction: the expiry measurement now allows five seconds for a cold server request. The product still sends exactly 3,600, 86,400, or 604,800 seconds and stores that exact deadline.

## What changed

- Added `share-expiry-options` to `.factory/claims.json` and a Playwright claim that selects 1 hour, 24 hours, and 7 days, checks the outgoing seconds, and measures the returned expiry.
- Rewrote public copy to use **expiring link** consistently. This includes the landing process step, link labels, offline/unavailable states, API errors, README, and claims.
- Rewrote the five flagged README explanations in plain language: browser separation, network-address request limit, server functions, storage ownership, and build identity.
- Updated the catalog description to: “Track recurring telemetry answers from approved readings and share expiring links.”

## Verification

- Final clean clone: `/tmp/tqb-final-clean-PXXnwH/repo` at `b9866c3`; `npm ci` and `npm --prefix api ci` passed. Every exact command in `.factory/claims.json` passed independently: **26/26**.
- The same clean clone passed `npm test` (**14 API + 30 Playwright tests**), `npm run lint`, `npm run typecheck`, and `npm run build`.
- Dependency audits: `npm audit --audit-level=high`, `npm audit --omit=dev --audit-level=high`, and `npm --prefix api audit --audit-level=high` all reported zero vulnerabilities.
- Local URL verifier: [verify.json](evidence/polish-3/local/verify.json) passed; local root and demo screenshots are [landing mobile](evidence/polish-3/local/screenshot-mobile.png) and [demo mobile](evidence/polish-3/local/demo-mobile.png).
- Live URL verifier: [root](evidence/polish-3/live/verify.json) and [direct demo](evidence/polish-3/live-demo/verify.json) both passed title, `lang`, one `h1`, `main`, image alt text, labeled controls, and zero load errors.
- Live browser check: [browser-qa.json](evidence/polish-3/live/browser-qa.json) records the cold first screen, one-click demo, no external request origin, three exact expiry choices, demo-link revocation, eight route/title/landmark checks, and **16 live axe scans with zero serious or critical violations**.
- Live mobile evidence: [landing](evidence/polish-3/live/screenshot-mobile.png), [demo](evidence/polish-3/live-demo/screenshot-mobile.png), [expiry selector](evidence/polish-3/live/expiry-options-mobile.png), and [404](evidence/polish-3/live/404-mobile.png).
- Mobile Lighthouse against the deployed URL: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.02 s, LCP 1.32 s, TBT 64 ms, CLS 0. Full report: [lighthouse.json](evidence/polish-3/live/lighthouse.json).
- Production build: JavaScript 35.84 kB raw / 11.68 kB gzip; CSS 16.91 kB raw / 4.82 kB gzip. `dist/index.html` is present.

## Reproduce

```bash
npm ci
npm --prefix api ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm --prefix api audit --audit-level=high
/opt/fleet/lib/deploy-static.sh telemetry-question-book dist
```

Use `https://telemetry-question-book.sociobot.in/?demo=1` for the isolated sample. Reset demo and Start for real revoke demo links and remove all `demo:` keys.

## Known gaps

None.
