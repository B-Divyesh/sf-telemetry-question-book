# Telemetry Question Book — independent verification handoff

## Release status

**FAIL — candidate `a74497cd00ba50776aea7d381ee4fe2e0101c9e6` is not releasable.**

Verified on 28 August 2026 against `https://telemetry-question-book.sociobot.in`. The live deploy matches the candidate byte-for-byte for all 13 checked artifacts. This verdict supersedes the builder-reported verification.

## Release blockers

- Expired answer data remains readable from the Base64 URL fragment, and a recipient can change expiry, status, and answer before re-encoding it. Snapshot expiry and integrity do not meet the brief.
- Existing questions cannot be edited or given a new reading. Re-importing a recurring question creates duplicates.
- The live `$49 once` checkout returns HTTP 404 (`enabled factory product`), so new customers cannot buy the advertised Support Pack.
- `.factory/claims.json` omits visitor-facing behaviors and several tagged tests assert only part of their claim.

Medium findings include three dead sample source links, missing required-field validation in CSV imports, sub-44 px mobile targets, a 2.779:1 focus ring on paper, an inline-style CSP violation on the real 404 response, and a high-severity advisory in the pinned Vite dev dependency. Full reproduction and severity details are in `.factory/verification.md`.

## What passed

- Cold first-read and one-click sample demo.
- All eight exact claim commands after `npm ci`.
- `npm test`: 9/9.
- `npm run build`: passed; `dist/index.html` produced.
- Normal authoring, invalid-input recovery, valid CSV import, downloads, storage persistence/isolation, reset/delete, snapshot UI paths, routing, and offline reload.
- Independent axe: zero serious/critical findings on all tested routes at desktop and 390 px.
- No normal-flow console/page errors or unexpected outbound requests.
- Security headers and CORS present.
- License API burst: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 2`.
- Mobile Lighthouse: 96 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.3 s; CLS 0.
- Bundles pass budgets: 9.41 KB gzip JS, 4.52 KB gzip CSS, no fonts, 42.65 KB mobile hero.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
node .factory/qa/run-browser-qa.mjs
```

See `.factory/verification.md` and `.factory/qa/browser-qa-results.json` for the independent evidence. Product code was not modified.

## Required next steps

1. Redesign shared snapshots so expiry and answer integrity cannot be bypassed by editing the URL.
2. Add and test update/edit of an existing reading without duplicate cards.
3. Register the product in Sociobot billing and exercise a real test checkout through return, verification, and download.
4. Complete `.factory/claims.json` and strengthen partial claim tests.
5. Fix demo links, CSV row validation, mobile touch targets, focus contrast, 404 CSP, and Vite.
6. Run the complete independent verification again before release.
