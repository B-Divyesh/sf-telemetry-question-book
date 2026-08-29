# Telemetry Question Book — adversarial review 2 handoff

## Outcome

Review 2 is complete with verdict **FAIL**. The complete evidence-backed report is in `.factory/review-2.md`.

Product code was not modified. Two earlier findings, F-1-5 and F-1-6, were reopened as blocking because their claim tests remain narrower than the registered promises. Thirteen new findings cover unlisted claims, a missing full-book backup export, desktop first-screen structure, a mobile skip-link overlap, and README wording/history.

## Verification performed

- Opened the live product cold in fresh Chromium 1.58.2 contexts at 390 × 844 and 1440 × 900.
- Exercised the one-click demo, editing, Reset, answer-copy review, expiring share, Start for real, demo-key cleanup, real-key isolation, link revocation, and offline reload.
- Recorded browser request origins throughout the live workflow; every request remained same-origin.
- Audited every fixed route at both viewports for status, title, description, canonical, Open Graph, Twitter card, favicon, Apple icon, `lang`, one `h1`, one `main`, alt text, console/page errors, and horizontal overflow.
- Crawled links from all valid routes and checked History API focus/back behavior.
- Ran 16 live axe scans; none had serious or critical violations.
- Read `.factory/brief.json`, `.factory/design.md`, `.factory/claims.json`, `.factory/review-1.md`, `.factory/polish-1.md`, and the prior handoff; independently checked every earlier finding in the live site and code.
- Audited every landing and README copy unit with word counts inside the review.

## Clean-clone commands

A separate local clone was created at `/tmp/tqb-review2-clean-ZpN2Vw/repo`, followed by `npm ci`.

- All 20 exact claim commands: PASS independently.
- `npm test`: PASS; 13 API and 24 Playwright tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` produced.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: PASS; zero vulnerabilities.
- Built JS: 34,648 bytes raw / 11.27 kB gzip.
- Built CSS: 16,808 bytes raw / 4.79 kB gzip.

## Remaining work

Resolve every finding in `.factory/review-2.md`, then repeat the entire adversarial review from clean storage and a clean clone. Do not treat the passing claim commands as closure until the tagged assertions prove the full registered wording. No AI feature is recommended because the brief explicitly prohibits LLM-generated explanations.
