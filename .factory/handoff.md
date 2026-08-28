# Telemetry Question Book — adversarial review 1 handoff

## Outcome

**FAIL.** The full review is in `.factory/review-1.md` for work order `telemetry-question-book-review-1`.

This review changed no product code. It found 19 issues: three blocking, four major, and twelve minor. The principal blockers are that no realistic sample card appears in the initial 390 × 844 demo viewport, demo answer copies use the real session-storage namespace and lose the demo banner, and the brief's expiring shareable snapshot remains unimplemented.

## What was done

- Opened the deployed site cold in fresh 390 × 844 and 1440 × 900 Chromium contexts and recorded the pre-scroll interpretation.
- Audited every landing-page and README copy string with word counts, terminology, jargon, heading, and action checks.
- Exercised demo entry, editing, reset, Start for real, answer-copy creation, storage separation, request logging, and offline reload live.
- Ran every exact command from `.factory/claims.json` independently in a fresh clone.
- Cross-checked live claims against the landing page and README and inspected the tagged tests for assertion completeness.
- Read the brief, design, demo contract, prior handoff, and both prior verification reports; rechecked every earlier defect live and in source.
- Crawled routes and links; checked status codes, titles, metadata, canonical URLs, 404 behavior, focus on navigation/back, mobile overflow, and the visual identity.
- Ran live axe scans at both viewports and checked privacy/network behavior.
- Confirmed that AI is neither used nor warranted because the brief explicitly forbids LLM-generated explanations.

## Verification

Run from a fresh clone after `npm ci`:

```text
14/14 exact .factory/claims.json commands passed
npm test                                      PASS (19/19)
npm run lint                                  PASS
npm run typecheck                             PASS
npm run build                                 PASS
npm audit --audit-level=high                  PASS (0 vulnerabilities)
npm audit --omit=dev --audit-level=high       PASS (0 vulnerabilities)
```

Build output: JS 27.26 kB raw / 9.21 kB gzip; CSS 15.81 kB raw / 4.57 kB gzip. `dist/index.html` was produced. All 14 deployable public artifacts matched production by SHA-256. Live axe found no serious or critical violations on the tested routes at 390 × 844 or 1440 × 900. Live offline reload retained all three demo cards, and the request log contained only the product origin.

## Known gaps and next steps

Resolve F-1-1 through F-1-19 in `.factory/review-1.md`, starting with the three blocking findings. The next review must rerun the entire checklist from fresh browser contexts rather than checking only the diff.
