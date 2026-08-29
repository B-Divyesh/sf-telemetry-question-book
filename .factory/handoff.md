# Telemetry Question Book — polish 4 handoff

## Outcome

**PASS.** All findings from reviews 1–4 are closed and mapped in `.factory/polish-4.md`. No known product, copy, claim, accessibility, privacy, offline, routing, mobile, or deployment gap remains.

Round 4 narrows the first-screen privacy and offline facts to what the product proves. It also rewrites deployment guidance as observable steps and registers result-level deployment and legacy-migration claims. The product-specific mid-century instrument-panel visual system and static-web deployment class are unchanged.

The final clean-clone replay exposed one texture-sensitive 3.96:1 primary-button label on mobile `/snapshot`. The dedicated black switch-label token keeps it above 4.5:1 without changing the amber control or visual direction.

## Exact verification

- Fresh clone at `63c02aba795498a8042c72aee4be6f3b685fa37f`: all 28 exact `.factory/claims.json` commands passed. Evidence: `.factory/evidence/polish-4/clean-claims.txt`.
- Fresh-clone `npm test`: 15 API tests and 31 Playwright tests passed, including browser, accessibility, privacy, offline, focus, dialog, routing, metadata, 404, demo-isolation, import/export, and share-lifecycle coverage. Evidence: `.factory/evidence/polish-4/clean-full-suite.txt`.
- Fresh-clone `npm run lint`, `npm run typecheck`, `npm run build`, root audits, API production audit, and `git diff --check`: passed with zero vulnerabilities. `dist/index.html` exists. Evidence: `.factory/evidence/polish-4/clean-repository-gates.txt`.
- Built JavaScript: 36,534 bytes raw / 11,872 bytes gzip. CSS: 17,062 bytes raw / 4,852 bytes gzip. Mobile hero: 42,650 bytes.
- Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0. Evidence: `.factory/evidence/polish-4/local/lighthouse.json`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 0 ms, CLS 0. Evidence: `.factory/evidence/polish-4/live/lighthouse.json`.
- Factory URL verification passed cold for `/` and `/?demo=1`: correct title, `lang`, one h1/main, image alt, labeled buttons, and zero console/page errors. Evidence: `.factory/evidence/polish-4/live/root/verify.json` and `.factory/evidence/polish-4/live/demo/verify.json`.
- The local/live 390 × 844 and 1440 × 900 matrix found no serious or critical Axe violation, no overflow, no undersized target, no valid-route console/page error, and correct focus restoration. Evidence: `.factory/qa/browser-qa-results.json`.
- Cold live demo verification measured the first sample question/value/state/freshness at 588/642/693/744 px; all fit the 844 px phone viewport. Reset restored `1,842`; Start for real cleared every `demo:` key and preserved all real sentinels.
- Cold live sharing verification measured 1 hour, 24 hours, and 7 days; each request sent the correct seconds, returned the matching deadline, opened from a `d_` URL, and returned 410 after revocation.
- The visited live demo reopened offline with all three readings and its offline notice. The full cold workflow requested only `https://telemetry-question-book.sociobot.in`.
- All fixed routes returned 200 with their own titles. `/definitely-missing-polish-4` returned the designed HTTP 404. Privacy and Terms remained linked in the shared footer.
- The contrast-hardened deployment reported `buildId=63c02aba795498a8042c72aee4be6f3b685fa37f`; forged network-address headers could not bypass its 100-request allowance. The final documentation/evidence commit is deployed and cold-checked again before delivery.
- Local and live HTML, JavaScript, CSS, and service worker files matched byte-for-byte by SHA-256 after deployment. Evidence: `.factory/evidence/polish-4/artifact-hashes.txt`.

## Run and verify

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Run every declared claim with the exact `test` command in `.factory/claims.json`. Run the live cumulative check with:

```bash
node .factory/qa/run-polish-4-live.mjs
```

Deploy only from a clean, committed checkout:

```bash
npm run deploy
```

## Known gaps and next steps

Known gaps: none. No AI feature is appropriate because the brief explicitly forbids generated explanations and the workflow is deterministic. Next steps are normal operational monitoring of the Static Web App and its snapshot storage; no product work is deferred.
