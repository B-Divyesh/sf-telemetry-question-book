# Telemetry Question Book — polish 1 handoff

## Outcome

**PASS.** All 19 findings in `.factory/review-1.md` are resolved. The product remains a Vite static web app on Azure Static Web Apps, with a managed first-party API only for expiring answer links.

## What changed

- Rewrote the first screen around the manual job: track answers from entered readings or an approved CSV.
- Made `/?demo=1` and `/demo` open the same isolated three-reading sample.
- Kept the demo banner visible through `/demo/snapshot`; all demo local/session keys use `demo:` and reset/exit revokes demo links before clearing them.
- Put the first complete sample reading inside the initial 390 × 844 viewport.
- Added opaque `/s/<token>` links with 1-hour, 24-hour, or 7-day expiry, default field hiding, revocation controls that survive preview reloads, and server-side payload removal.
- Added 18 registered claim tests, including card persistence, full CSV boundaries, demo sentinels, expiry, tamper resistance, redaction, revocation, privacy requests, and offline reload.
- Added distinct route titles and descriptions, canonical/OG/Twitter updates, focus and history behavior, sitemap entries, real 404 metadata/shell, and complete legal explanations.
- Preserved the mid-century instrument-panel visual system and original generated console art.

## Verification

From a clean clone after `npm ci`:

```text
18/18 exact commands from .factory/claims.json     PASS
npm test                                           PASS (24/24)
npm run lint                                       PASS
npm run typecheck                                  PASS
npm run build                                      PASS
npm audit --audit-level=high                       PASS (0 vulnerabilities)
npm audit --omit=dev --audit-level=high            PASS (0 vulnerabilities)
npm --prefix api audit --audit-level=high           PASS (0 vulnerabilities)
```

Build output: initial JS 34.51 kB raw / 11.21 kB gzip; CSS 16.81 kB raw / 4.79 kB gzip; no web fonts; mobile hero 42.65 kB. `dist/index.html` exists.

Production evidence at <https://telemetry-question-book.sociobot.in>:

- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console errors, title/lang/one h1/main/alt/button labels pass.
- Browser + axe matrix: 32 route/viewport checks, zero serious/critical violations, zero horizontal overflow, zero undersized controls.
- Shared-answer axe check: zero serious/critical violations and zero console errors.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 10 ms.
- Production deployment ID: `3307865e-ec0d-4e6e-bc78-6ae120d59477`.
- Live API: expiry `200 → 410`; revocation `200 → 204 → 410`; storage inspection confirms `payload_retained=false` after both.
- Cold live 390 × 844: first card fields occupy y 588–763; banner persists on `/demo/snapshot`; real storage sentinels survive Reset demo and Start for real.
- Privacy: normal landing/demo/update requests stay same-origin; no analytics, third-party font/script, account, automatic telemetry query, or alert request occurs.

## Run and deploy

```bash
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh telemetry-question-book dist
```

Deployment needs the secret Static Web App setting `SnapshotStorage`, pointing to approved first-party Azure Storage. It is configured in production and is not committed.

## Known gaps

None. AI was not added because the brief explicitly forbids LLM-generated explanations and the core job does not need it. The unavailable paid offer remains removed rather than advertising a broken checkout.
