# Telemetry Question Book — review 6 handoff

## Outcome

**FAIL — one reopened blocking finding remains.** Review 6 found that F-1-6,
the claim-to-test coverage mismatch, is still only partly fixed. The live
product behavior checked in this round works, but five tagged tests do not
prove the complete promises recorded in `.factory/claims.json`.

No product code was modified. The review is in `.factory/review-6.md`.

## What was done

- Opened the live product cold in fresh 390 × 844 and 1440 × 900 Chromium
  contexts and recorded the first-screen interpretation before scrolling.
- Exercised the one-click demo, sample reset, separate storage, answer-copy
  preview, expiring link, revocation, Start for real, and offline reload.
- Recorded live requests across normal and sharing flows; only the product
  origin was contacted, and the snapshot API was called only after explicit
  sharing actions.
- Audited every landing and README sentence for length, jargon, terminology,
  heading clarity, and action wording.
- Ran every literal claim command independently from a fresh clone, then ran
  the full suite and repository gates.
- Rechecked every finding from reviews 1–5 against live behavior and current
  code/tests.
- Audited route metadata, deep links, history focus, 404 behavior, all page
  links, keyboard focus, mobile overflow, and Axe results at both viewports.

## Verification results

- 28/28 literal claim commands: PASS.
- `npm test`: PASS — 15 API tests and 33 Playwright tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` produced.
- Full and production high-severity dependency audits: PASS.
- `git diff --check`: PASS.
- Live Axe: zero serious or critical findings across 22 route/viewport scans.
- `/opt/fleet/lib/verify-url.sh`: PASS for `/` and `/demo`.
- Live static and API build IDs both equal
  `566300dfe913e1feb162af3deae250721034cbdd`.

## Remaining work

Close F-1-6 in `tests/claims.spec.ts`:

1. Prove Reset revokes an existing demo link, removes prior demo keys, re-seeds
   only the sample workspace, and preserves real sentinels; repeat the cleanup
   assertions for Start for real.
2. Successfully import CSV freshness `10080` inside `@claim:csv-validation`.
3. Compare the CSV template header exactly and inspect its sample row.
4. Pre-seed and compare the real preview key inside
   `@claim:answer-copy-security`.
5. Compare the downloaded JSON’s exact included fields and answer content with
   the reviewed preview.

Then rerun all 28 manifest commands and the complete review. No other product,
copy, structure, accessibility, privacy-behavior, or feature gap was found.
