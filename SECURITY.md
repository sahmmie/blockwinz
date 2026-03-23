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
- **Access JWT lifetime:** `JWT_ACCESS_EXPIRES_IN` (default `15m` in code) — signing uses `jsonwebtoken` in `AuthenticationRepository`.
- **Refresh sessions:** HttpOnly cookie `bwz_refresh` (rotation on `POST /api/authentication/refresh`, Redis keys `refresh:{sha256}`). Production uses `SameSite=None; Secure` for cross-origin SPA + API.
- **Wallet encryption:** **`DATA_ENCRYPTION_KEY` is required** for encrypting/decrypting user wallet private keys. It is separate from `JWT_SECRET`; there is no fallback between them.

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

- **Implemented:** Short-lived **access** JWT (default **15m**), **refresh** rotation via **httpOnly** cookie + Redis; access token held **in memory** on the SPA (not `localStorage`). Axios uses `withCredentials` for cookie-backed refresh.

**Residual:** CSRF on refresh is mitigated by `SameSite` (`Lax` dev, `None`+`Secure` prod cross-site); state-changing cookie routes are limited to refresh/logout.

### API documentation (Swagger)

- **Production:** Swagger UI is off unless `ENABLE_SWAGGER=true`. Non-production keeps docs with `persistAuthorization` — avoid real tokens in the browser on shared machines.

**Direction:** Optionally add basic auth or VPN for any environment where Swagger stays enabled.

### Request validation

- Global `ValidationPipe` uses **`whitelist`**, **`forbidNonWhitelisted`**, **`transform: true`**, with `skipMissingProperties: true` retained until a full DTO audit.

### Public bet leaderboard

- **`user` id is omitted** from public leaderboard rows. Rate limiting remains on the controller.

### OTP and login brute force

- **Rate limits** on login, registration, password-reset, waitlist, verify-email, resend, and admin OTP routes (`RateLimitGuard` + Redis).

### Cryptographic key separation

- **`DATA_ENCRYPTION_KEY`** is mandatory for wallet at-rest crypto (`wallet-encryption.helper.ts`). **`JWT_SECRET`** is only for JWT signing/verification, not wallet ciphertext.

### Swagger / docs examples

- OpenAPI examples use **neutral placeholders** (`user@example.com`, `Str0ng!Ex4mpleP@ss`, etc.).

### Admin UI

- Chart component documents that injected CSS is built only from trusted `ChartConfig` (no user-controlled strings).

---

## Remediation backlog (checklist)

Use this as a tracking list; tick items in PRs or issue trackers as you complete them.

1. ~~**Withdrawals:** Wire rate limit guard; fix idempotency path/method; improve rate-limit key design (route + user/key).~~ **Done**
2. ~~**IDORs:** Scope withdrawal status and bet-by-id to owner or admin.~~ **Done**
3. ~~**WebSockets:** `lastLogout` / `iat` parity with HTTP; tighten WS CORS.~~ **Done**
4. ~~**Operations:** Disable or gate Swagger in production; harden `send-bwz` (wallet binding, env safety).~~ **Done**
5. ~~**Tokens:** Short-lived access JWT + refresh token flow (Redis-backed rotation).~~ **Done**
6. ~~**Frontend session:** httpOnly refresh cookie + in-memory access token; axios `withCredentials`.~~ **Done**
7. ~~**CSP:** Content-Security-Policy on Netlify (`connect-src` for API/WebSocket).~~ **Done** — *adjust `connect-src` in `netlify.toml` for your RPC/CDN hosts.*
8. ~~**ValidationPipe:** `whitelist` + `forbidNonWhitelisted` (+ `transform`); `skipMissingProperties` unchanged pending DTO audit.~~ **Done**
9. ~~**Public leaderboard:** Redacted fields on `GET /bet-history/all` public response.~~ **Done**
10. ~~**Auth endpoints:** Rate limits on login, registration, password-reset, admin OTP.~~ **Done**
11. ~~**Encryption:** `DATA_ENCRYPTION_KEY` only for wallet crypto (no `JWT_SECRET` fallback).~~ **Done**
12. ~~**Docs:** Sanitize Swagger examples (neutral placeholders).~~ **Done**
13. ~~**Admin:** Chart `dangerouslySetInnerHTML` — trusted input only (documented in component).~~ **Done**

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
