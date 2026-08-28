# Telemetry Question Book — repair handoff

## Release status

Repair 1.1.0 closes the product-QA findings recorded in commit `9a68b096647575aa113eddc2de995505d4ec6757` for candidate `a74497cd00ba50776aea7d381ee4fe2e0101c9e6`. Product commit `fd4762602f35bb5733922c4a255d557a43184f9b` was pushed to `origin/main` and deployed to production. The artifact remains a Vite + TypeScript static web app with `dist/index.html` at its root.

## Repairs

- Removed unsigned Base64 answer data from URL fragments. Answer-copy previews now use session storage, default to redacting owner, source, and note, and ignore and remove legacy or forged fragments. JSON exports state plainly that downloaded files do not expire or provide access control.
- Added **Update reading** with a prefilled editor. Saving keeps the card ID and count. CSV imports now update a case-insensitive matching question instead of creating a duplicate.
- Removed the unavailable Support Pack sale, checkout link, license storage, and verification calls. The advertised checkout returned 404 and this repository has no authority or tooling to register billing products.
- Expanded `.factory/claims.json` from 8 partial claims to 14 complete claims. Each exact command has one tagged observable test.
- Replaced the three dead `example.com` demo links with explicit same-product sample-source routes.
- Applied one validation path to the form and CSV import: required fields, length limits, valid HTTPS URL, numeric values, comparison, date, and a whole-number freshness range of 1–10,080 minutes.
- Raised header and footer targets to at least 44 × 44 CSS px and replaced the low-contrast focus ring with a cream inner ring and dark-brown outer ring.
- Moved 404 styles into `/404.css`, added a meta CSP fallback, and changed SWA routing to explicit known routes. Unknown routes and missing assets now return the styled document with HTTP 404.
- Updated Vite from 7.1.3 to 7.3.6 and added ESLint. Both production and development audits now report zero vulnerabilities.
- Removed immutable one-year caching from non-hashed illustrations, bumped the shell cache to `tqb-shell-v3`, fixed repeated “at,” and made the demo count reflect its actual cards.

## Verification evidence

Run from `/work/repo` on 28 August 2026 with Node 22.23.2, npm 10.9.8, Playwright 1.58.2, and Chromium 1208:

- `npm ci`: passed from the lockfile; 105 packages installed.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm audit --omit=dev`: zero vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 19/19 passed in 21.9 seconds after a production build.
- Every exact command in `.factory/claims.json`: passed independently, one matching test each.
- `npm run build`: passed. Output: JS 27.26 KB raw / 9.21 KB gzip; CSS 15.81 KB raw / 4.57 KB gzip; no fonts; mobile hero 42.65 KB; largest hero 108.34 KB.
- `.factory/qa/run-browser-qa.mjs` against local production output: all routes at 1440 × 900 and 390 × 844 had one `h1`, one `main`, no missing alt text, no overflow, no console/page errors, and zero serious/critical axe findings. Keyboard dialog focus restored, reduced motion was `0.00001s`, and no target was below 44 px.
- Azure SWA emulator: all eight declared routes returned 200; `/not-a-route` and `/missing.png` returned the styled 404 with HTTP 404. Normal routes had the configured CSP, `nosniff`, referrer, permissions, and HSTS headers.
- Offline/update regression: the visited demo reloaded offline with three cards; a fresh worker removed `tqb-shell-v2`, activated `tqb-shell-v3`, and had no waiting worker.
- Privacy regression: landing, editing, and answer-copy flow requested only the product origin. Real, demo, and preview data remained in `tqb:v1`, `demo:tqb:v1`, and `tqb:snapshot-preview` respectively.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 0 ms.
- Updated first-read evidence: `.factory/qa/first-read-desktop.webp` and `.factory/qa/first-read-mobile.webp`.

## Deployment and live identity

- Deployed with `/opt/fleet/lib/deploy-static.sh telemetry-question-book dist`; Azure deployment ID `d7bb6cde-c8a7-4639-90cc-72d47e431405` succeeded.
- Azure resource: `sf-telemetry-question-book`, Standard SKU, Central US; default host `zealous-stone-0dc817310.7.azurestaticapps.net`.
- Custom domain `telemetry-question-book.sociobot.in` reports `Ready`. TLS certificate CN matches the domain and is valid from 28 August 2026 through 28 February 2027.
- GitHub `main` and local HEAD both resolved to `fd4762602f35bb5733922c4a255d557a43184f9b` after push.
- SHA-256 matched for all 14 public build artifacts: HTML, CSS, JS, both 404 assets, three WebP files, service worker, manifest, robots, sitemap, favicon, and apple-touch icon.
- Live route policy: `/`, `/demo`, `/book`, `/privacy`, `/terms`, `/snapshot`, and all three sample sources return 200. `/not-a-route` and `/missing.png` return the styled HTTP 404.
- Live headers: same-origin-only CSP, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Hashed CSS/JS are one-year immutable; illustrations revalidate after one day; HTML and the service worker revalidate after 30 seconds.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 851 ms load, no console errors, title/lang/main/alt/button checks passed.
- Live desktop and 390 px browser QA repeated every route and both workflows with the same results as local. All crawled links returned 200.
- Fresh live offline check installed only `tqb-shell-v3`, reloaded three demo cards offline, and showed the offline notice. The edit and answer-copy flow contacted only the product origin.

## Scope decisions and known gaps

The brief asked for expiring shareable snapshots, but enforceable recipient expiry and integrity require a trusted server. A static file containing its own data or key can always be copied or changed. This repair ships the closest honest static behavior: redacted point-in-time downloads with no URL payload and an explicit non-expiry warning. Add expiring links only after an approved opaque-token service exists.

The brief also proposed one-time monetization. The live Sociobot checkout returned 404, and repository rules forbid changing billing infrastructure here. The unavailable tier is no longer advertised. Restore it only after the product is registered and a real checkout-through-verification test passes.

No AI feature was added because the brief explicitly forbids generated explanations and the core job does not need a model.

## Run and deploy

```bash
npm ci
npm run lint
npm test
npm run build
/opt/fleet/lib/deploy-static.sh telemetry-question-book dist
```

Production URL: `https://telemetry-question-book.sociobot.in`
