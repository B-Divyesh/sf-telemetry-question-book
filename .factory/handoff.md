# Telemetry Question Book — handoff

## What shipped

- A Vite and TypeScript static app with routes for `/`, `/demo`, `/book`, `/snapshot`, `/privacy`, `/terms`, and a styled 404.
- A real local question book with question, owner, approved HTTPS source, reading, unit, threshold, comparison, observed time, freshness limit, and note.
- CSV template download and CSV import with quoted-cell parsing and plain error messages.
- On-track, needs-attention, and stale states calculated from each saved reading.
- Answer snapshots stored in the URL, with 24-hour, 3-day, or 7-day expiry and default owner/source/note redaction.
- An isolated one-click demo with three realistic questions, reset, and start-for-real controls. Demo storage uses `demo:tqb:v1`; real storage uses `tqb:v1`.
- A production service worker that caches the visited shell and supports an offline reload.
- A $49 one-time Support Pack tier using Sociobot checkout, return-token storage, daily verification caching, restore-by-paste, and a licensed connector/template download.
- Privacy and terms pages, route-aware titles and canonical links, metadata, social art, sitemap, robots file, CSP, security headers, and an Azure Static Web Apps SPA fallback.
- A product-specific mid-century instrument-panel system and original generated console illustration. Source and provenance are in `assets/src/`; optimized assets are in `public/assets/`.

## Run and verify

```bash
npm install
npm test
npm run build
```

The deploy command is exactly `npm run build`. Output lands in `dist/`, and `dist/index.html` is present.

Verification completed on 2026-08-28:

- `npm test`: 9 passed.
- Production build: passed.
- JavaScript: 27.49 KB raw / 9.41 KB gzip.
- CSS: 15.46 KB raw / 4.52 KB gzip.
- Largest hero asset: 108 KB; mobile hero asset: 43 KB.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console errors, one `h1`, one `main`, language set, all images have alt text.
- Playwright axe scan: zero serious or critical issues on landing and the 390 px demo.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.4 s, FCP 0.9 s, Total Blocking Time 20 ms, CLS 0.
- Evidence summaries: `.factory/evidence/verify.json` and `.factory/evidence/lighthouse-summary.json`.

## Known gaps and release notes

- The factory must register `telemetry-question-book` with Sociobot billing before the live checkout can complete.
- Snapshots are portable URL payloads, not encrypted messages. Redaction is on by default, expiry is enforced by the app, and senders must still review each link.
- Question readings are entered or imported. Automatic telemetry ingestion, query generation, and alerting are intentional non-goals for v1.
- The generated source PNG is kept for provenance and is not copied into `dist/`.

## Next steps

- Pilot with one support and engineering pair for four weeks.
- Track whether at least 30% of recurring checks are answered without an engineer.
- Use pilot feedback to choose the first maintained connector recipe updates.
