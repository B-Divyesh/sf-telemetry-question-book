# Telemetry Question Book — repair 3 handoff

## Outcome

Release blockers from verifier report commit `753ed029b0f7fef81360a3d6e89c95de39791c03` are repaired and deployed.

- Repaired candidate: `fa32cba7f09cff6edcf881779dd47c7b040bfd76`
- API code commit: `29c993d`
- Live URL: <https://telemetry-question-book.sociobot.in>
- Live build identity: `telemetry-question-book-repair-3-29c993d`
- Azure deployment ID: `ea09f23f-dac2-4d07-8f9d-68d317f014d7`
- Verified: 29 August 2026 UTC

## Repairs

1. All anonymous snapshot create, open, and revoke routes now share one atomic Azure Table allowance per client: 100 requests per 60-second window. Limiting happens before validation or payload access. Excess requests return `429`, `Retry-After`, and rate-limit headers. Health is read-only and intentionally exempt. Forwarded addresses are normalized before hashing, including Azure's changing source ports.
2. Answer payloads moved from Azure Table Storage to individual Azure Queue messages with the selected service-enforced TTL. The metadata table contains no answer payload. Azure removes each message without a later recipient read; revocation deletes it immediately. The migration command moved two still-active legacy payloads to TTL storage and found no expired legacy payloads.
3. The create boundary now rejects wrong types, missing or extra keys, invalid ISO dates, unknown states, excessive lengths, demo mismatches, and broken redaction invariants. Invalid data returns `400` with: “The answer copy is invalid. Review it and try again.” The read boundary also removes malformed legacy data and returns a plain unavailable response.
4. `/api/health` now returns the injected, sanitized, non-secret `buildId`. No environment value other than the configured identity is exposed.
5. The privacy page and README now describe automatic payload expiry and the exact request allowance. Claims and exact tagged regressions cover both statements.
6. The service-worker cache advanced to `tqb-shell-v5`, so existing installations replace the prior shell cleanly.

The pre-fix reproduction returned 400 for all 65 invalid creates, accepted the verifier's malformed typed payload with 201, and exposed no health identity. Those cases are now regression tested.

## Verification evidence

### Clean install and repository gates

- `npm ci`: pass; 105 packages, zero audit findings.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass; 13 API tests and 24 Playwright tests.
- `npm run build`: pass; `dist/index.html` produced.
- All 20 exact commands in `.factory/claims.json`: pass independently.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities.
- `npm --prefix api audit --audit-level=high`: zero vulnerabilities.
- Package/consumer test: not applicable to this static web product.

### API and storage regressions

- Atomic concurrency test: 120 simultaneous operations admitted exactly 100 and denied 20.
- Port-normalization regression: rotating IPv4 and IPv6 source ports map to one client.
- Schema matrix covers the verifier payload, scalar types, dates, enum, sizes, extra keys, demo type/match, and redaction invariants.
- Storage regression asserts the metadata row has no payload, the queue receives the exact TTL option, and the payload disappears without calling `get`.
- Legacy migration regression removes expired payloads and migrates active payloads without reading their tokens.
- Health regression sends 200 requests and verifies the endpoint stays available with only its non-secret identity.

### Live API

- Verifier's malformed payload: `400` with the documented recovery error; no write.
- Two-second live TTL probe: payload present before expiry, absent from Queue Storage after 3.2 seconds without a snapshot read; metadata never contained the payload; later API read returned `410`.
- Concurrent lifecycle: 20/20 unique creates returned `201`; 20/20 reads returned `200`; 20/20 revokes returned `204`; 20/20 later reads returned `410`.
- Fresh live allowance burst: requests 1–100 reached validation; request 101 returned `429`, `Retry-After: 44`, and `X-RateLimit-Limit: 100`.
- At exhaustion, GET returned `429` with `Retry-After: 37`; DELETE returned `429` with `Retry-After: 36`.
- Health remained `200` and reported `telemetry-question-book-repair-3-29c993d`.
- All temporary live snapshot records were expired, revoked, or explicitly removed.

### Browser, accessibility, privacy, and offline

- Local and live at 1440 × 900 and 390 × 844: all routes have one `h1`, one `main`, route titles, canonical metadata, alt text, and no horizontal overflow.
- 32 axe route/viewport scans: zero serious or critical findings.
- Keyboard: visible skip link first; demo action works with Enter; dialog Escape restores focus; no trap.
- Touch targets: none below 44 × 44 CSS pixels in the tested mobile UI.
- Reduced motion: ticket animation is `0.00001s`.
- Normal workflows have no console or page errors. The deliberate 404 emits only the expected failed-resource message.
- Browser request logs remained same-origin. No analytics, external fonts/scripts, account, AI, payment, or telemetry-query traffic exists.
- Fresh live service-worker install uses `tqb-shell-v5`; offline `/demo` reload retained all three cards and showed the offline notice.
- `/opt/fleet/lib/verify-url.sh` passed local and live with zero console errors.
- Fourteen served static artifacts match local `dist/` byte-for-byte by SHA-256.

Evidence: `.factory/qa/browser-qa-results.json`, `.factory/evidence/repair-3-local/`, and `.factory/evidence/repair-3-live/`.

### Performance

Lighthouse 13.4.1 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local | 100 | 100 | 100 | 100 | 1.1 s | 1.5 s | 0 ms | 0 |
| Live | 100 | 100 | 100 | 100 | 1.0 s | 1.3 s | 0 ms | 0 |

Production sizes: JavaScript 34,648 bytes raw / 11,238 bytes gzip; CSS 16,808 bytes raw / 4,786 bytes gzip; mobile hero 42,650 bytes; largest image 108,344 bytes; no downloaded fonts.

## Run and verify

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

For a legacy deployment only, supply `SnapshotStorage` out of band and run `npm --prefix api run cleanup:legacy` once. Never commit the connection string.

## Known gaps and next steps

No release-blocking gap remains. Expired queue shells and non-content metadata may remain so unavailable links can return a stable result; they contain no answer-copy payload. A future operational cleanup may remove those empty records after the maximum seven-day link period.

AI, sign-in, paid unlock, library packaging, and CLI installation are not applicable to this free static-web release.
