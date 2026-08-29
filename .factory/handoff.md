# Telemetry Question Book — adversarial review 4 handoff

## Outcome

**FAIL.** Review 4 found one blocking, one major, and two minor copy/claim
contract defects. Product code was not modified. The full report is
`.factory/review-4.md`.

The blocking issue is the first-screen statement “Data stays in this browser.”
Question cards do stay local, but creating an expiring link intentionally
sends the reviewed answer copy to the site’s sharing service. The proposed
copy is “Question cards stay in this browser.”

The remaining findings narrow the offline statement to its tested result,
replace deployment jargon, and register the documented deployment/migration
guarantees in `.factory/claims.json`.

## Verification completed

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- Exercised demo reset, preview, expiring-link creation, demo exit, revocation, real-data sentinels, offline reload, request logging, and history/focus behavior.
- Audited live routes, metadata, 404, links, mobile overflow, and Axe serious/critical results.
- Read every prior review, polish report, and handoff, then independently rechecked every earlier finding.
- Ran all 26 exact claim commands independently from a clean clone.
- Ran `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, full and production dependency audits, and `git diff --check`.
- Confirmed the live HTML, JavaScript, CSS, and service worker match the clean build byte-for-byte.

## Results

- 26/26 manifest claim commands passed.
- Full suite passed: 15 API tests and 31 Playwright tests.
- Build produced `dist/`; JavaScript is 36,513 bytes raw / 11.91 kB gzip.
- Factory URL verification passed for `/` and `/demo` with no console/page errors.
- Live request logs were same-origin only; demo data remained isolated; the created `d_` link changed from 200 to 410 after leaving demo.
- No earlier review finding regressed.

## Next steps

Implement only the four fixes specified in `.factory/review-4.md`, then rerun
the entire review rather than a diff-only check. No infrastructure, DNS,
billing, or deployment action was taken in this work order.
