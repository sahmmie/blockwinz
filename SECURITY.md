# Security

BlockWinz handles wagering and wallet flows. This document summarizes **known risk areas**, **recommended mitigations**, and a **remediation backlog**. It is a living document; update it as controls are implemented.

## Scope

| Area | Path |
|------|------|
| API | `blockwinz-api/` |
| Web app | `blockwinz-FE/` |
| Admin | `blockwinz-admin/` |

## Principles

- **Server authority:** Stakes, outcomes, and balances must be decided and enforced on the server. Never trust the client for game results or financial state.
- **Least privilege:** Every money-adjacent read/write must be scoped to the authenticated user (or explicit admin roles).
- **Defense in depth:** Combine authz checks, rate limits, idempotency, secure sessions, and operational controls (e.g. disabling debug endpoints in production).

## Runtime configuration (API)

- **Swagger:** Disabled when `NODE_ENV=production`. Set `ENABLE_SWAGGER=true` to force-enable (e.g. a secured staging host).
- **HTTP / WebSocket CORS:** Allowed browser origins live in `blockwinz-api/src/shared/constants/cors-origins.constant.ts` — update that file when adding new front-end URLs.

---

## Critical / high risks (summary)

### Withdrawal abuse controls

- **Rate limiting:** Withdrawal routes use `RateLimitGuard` with Redis keys scoped by **method, route path, user id, and IP**.
- **Idempotency:** `PUT withdrawals/request` uses `IdempotencyMiddleware` with the `withdrawal-key` header (24h response cache per key).

**Risk:** Duplicate or rapid-fire withdrawal requests, queue spam, weaker “exactly once” guarantees for user intent.

### Insecure direct object references (IDOR)

- **Withdrawal status:** Enforced — `requestId` lookups return **404** unless the row belongs to the authenticated user or `isAdmin` on the request.
- **Bet history by ID:** Enforced — same pattern for bet UUID detail (admins may read any).

**Risk (residual):** Ensure new money-adjacent endpoints follow the same ownership checks.

### Testnet “free BWZ” faucet (`send-bwz`)

- **Blocked when `NODE_ENV=production`.** Still requires `SOLANA_NETWORK=testnet`.
- **Wallet binding:** `walletAddress` must match the user’s registered BWZ wallet.

**Risk:** Faucet drain or quota abuse on non-production testnet/staging if other controls are weak.

### WebSocket authentication and CORS

- **Session parity:** `WsAuthGuard` rejects tokens issued before `lastLogout` (aligned with HTTP `AuthenticationGuard`).
- **CORS:** Socket.IO and gateways use the same origin allowlist as HTTP (`cors-origins.constant.ts`).

**Risk (residual):** New WebSocket namespaces must reuse the shared CORS config.

---

## Medium risks (summary)

### JWT storage and lifetime

- Storing bearer tokens in **localStorage** exposes them to any XSS on the origin.
- Long-lived JWTs (e.g. multi-day) extend compromise windows.

**Direction:** Short-lived **access** tokens, **refresh** tokens with rotation and server-side revoke, and **httpOnly** `Secure` cookies plus a CSRF strategy (e.g. `SameSite` + double-submit or header checks).

### API documentation (Swagger)

- **Production:** Swagger UI is off unless `ENABLE_SWAGGER=true`. Non-production keeps docs with `persistAuthorization` — avoid real tokens in the browser on shared machines.

**Direction:** Optionally add basic auth or VPN for any environment where Swagger stays enabled.

### Request validation

- Global `ValidationPipe` without `whitelist` / `forbidNonWhitelisted` and with `skipMissingProperties: true` weakens protection against unexpected body fields.

**Direction:** Enable whitelist-based stripping and forbid unknown properties where compatible with existing DTOs.

### Public bet leaderboard

- Public `GET /bet-history/all` can leak patterns useful for OSINT and targeted scams.

**Direction:** Product decision—redact fields, require auth, or add stricter rate limits as appropriate.

### OTP and login brute force

- Password reset and OTP verify endpoints need **per-IP and per-identifier** throttling and monitoring.

### Cryptographic key separation

- Using `JWT_SECRET` as the sole material for wallet-related encryption couples rotation and compromise domains.

**Direction:** Use a dedicated **data encryption key** (env/KMS) for at-rest secrets, separate from signing keys.

### Swagger / docs examples

- Remove or neutralize realistic passwords and emails from OpenAPI examples to avoid implying weak or real credentials.

### Admin UI

- Any `dangerouslySetInnerHTML` (e.g. charts) requires trusted input only or sanitization; keep admin dependencies patched.

---

## Remediation backlog (checklist)

Use this as a tracking list; tick items in PRs or issue trackers as you complete them.

1. **Withdrawals:** Wire rate limit guard; fix idempotency path/method; improve rate-limit key design (route + user/key).
2. **IDORs:** Scope withdrawal status and bet-by-id to owner or admin.
3. **WebSockets:** `lastLogout` / `iat` parity with HTTP; tighten WS CORS.
4. **Operations:** Disable or gate Swagger in production; harden `send-bwz` (wallet binding, env safety).
5. **Tokens:** Short-lived access JWT + refresh token flow (rotation, revoke list or version, secure storage).
6. **Frontend session:** Prefer httpOnly cookies + CSRF over localStorage for session tokens.
7. **CSP:** Add Content-Security-Policy and reduce XSS surface on the web app.
8. **ValidationPipe:** `whitelist`, `forbidNonWhitelisted`; revisit `skipMissingProperties`.
9. **Public leaderboard:** Policy review (redaction, auth, limits).
10. **Auth endpoints:** Rate limit login, password-reset, admin OTP verification.
11. **Encryption:** Dedicated key/KMS for wallet encryption, not `JWT_SECRET`.
12. **Docs:** Sanitize Swagger examples.
13. **Admin:** Audit chart / HTML rendering paths for XSS.

---

## Reporting vulnerabilities

If you believe you have found a security vulnerability, please report it responsibly:

- Prefer a **private** channel (e.g. security email or maintainer contact) rather than a public issue.
- Include steps to reproduce, affected component (API / FE / admin), and impact assessment if possible.

Do **not** exploit vulnerabilities against production users or wallets without explicit authorization.

---

## References (in-repo)

- API bootstrap and HTTP hardening: `blockwinz-api/src/main.ts`
- Global auth guard: `blockwinz-api/src/shared/guards/authentication.guard.ts`
- WebSocket auth: `blockwinz-api/src/shared/guards/ws-auth.guard.ts`
- Withdrawals: `blockwinz-api/src/withdrawal/`
- Bet history: `blockwinz-api/src/betHistory/`
- Frontend auth state: `blockwinz-FE/src/hooks/useAuth.ts`
