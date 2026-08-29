# Telemetry Question Book — perfection loop 2 handoff

## Outcome

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed. The repair preserves the mid-century instrument-panel design and the static-web deployment class.

The main product addition is a complete **Export question book CSV** backup. The downloaded file contains only the active real or demo workspace and imports into an empty workspace without duplicate cards.

Claim coverage now matches the public wording. Tests complete each promised result, including both form and CSV validation, all free workflows, HTTPS source saving, CSV schema values, offline sharing recovery, exact sharing metadata, immediate answer deletion on revocation, the shared three-route allowance, and health-route exemption.

The service worker never caches `/api/` responses. A shared answer therefore cannot be reopened from a cached API response while offline.

## Verification

- Clean clone: `/tmp/tqb-polish2-clean-b6FZhV/repo` at repair commit `f6ab850`.
- All 25 exact commands in `.factory/claims.json`: passed independently.
- `npm test`: passed; 14 API tests and 29 Playwright tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities.
- Route/viewport matrix: 16 local scans, zero serious or critical axe findings, zero overflow, and no valid-route console or page errors.
- Keyboard: skip-link focus, hybrid pointer navigation, dialog focus/escape restoration, history focus, and reduced-motion checks passed.
- Privacy/offline: demo/real sentinels, API-cache exclusion, offline reload, offline share failure, reconnect recovery, expiry, revocation, and storage minimization passed.
- Local URL verifier: `.factory/evidence/polish-2/local/verify.json`.
- Local screenshots: `.factory/qa/local-1440-landing.png`, `.factory/qa/local-1440-demo.png`, `.factory/qa/local-390-landing.png`, `.factory/qa/local-390-demo.png`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, TBT 10 ms, CLS 0.
- Output sizes: JavaScript 35,859 bytes raw / 11.68 kB gzip; CSS 16,909 bytes raw / 4.82 kB gzip; mobile hero 42,650 bytes.

## Run and deploy

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
/opt/fleet/lib/deploy-static.sh telemetry-question-book dist
```

The managed snapshot functions require the existing secret `SnapshotStorage` setting. No secret is stored in the repository.

## Live verification

Deployment and cold live verification evidence will be recorded under `.factory/evidence/polish-2/live/` in the final evidence commit.

## Known gaps

None.
