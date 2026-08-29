# Telemetry Question Book — verifier handoff 6

## Outcome

**FAIL — release blocked.** Independent verification of candidate
`1a83723b76b50a7aab88f8bf8fd824086e69bbf3` found a live anonymous API
rate-limit bypass and a live API build identity that is not the candidate.

See [verification-6.md](verification-6.md) for exact reproduction, evidence,
and the complete passing local/browser checks.

## How to verify the fixed candidate

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Test the isolated sample at `https://telemetry-question-book.sociobot.in/demo`.
For the live API, exhaust one actual client allowance and verify that changing
any client-supplied forwarding header cannot produce a new allowance. Confirm
`/api/health` reports the exact deployed commit as `buildId`.

## Blocking defects

1. **High:** `X-Azure-ClientIP` can be changed by a requester to reset the
   advertised 100-request API allowance.
2. **High:** live `/api/health` reports
   `telemetry-question-book-repair-3-29c993d`, not the verified candidate.

No product source code was changed during verification.
