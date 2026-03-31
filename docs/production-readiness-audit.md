# Production Readiness Audit

## Executive Summary

This audit reviewed the `blockwinz-api` and `blockwinz-FE` applications for production gaps that could lead to account compromise, fund loss, fairness compromise, or silent operational failure.

The highest-risk issues are not cosmetic. The current codebase contains multiple places where sensitive material appears to cross trust boundaries, and several core money/auth flows rely on patterns that are not robust under concurrency or production failure.

## Critical

### 1. Auth/profile responses expose secrets and prediction-enabling user state
- Evidence:
  - `blockwinz-api/src/authentication/repositories/authentication.repository.ts`
  - `blockwinz-api/src/shared/dtos/user.dto.ts`
  - `blockwinz-api/src/authentication/controllers/authentication.controller.ts`
- What is happening:
  - `toUserDto()` includes `password`, `futureServerSeed`, `futureServerSeedHash`, `emailVerificationToken`, and `activeSeed.serverSeed`.
  - `POST /authentication/registration` returns `{ user: UserDto, token }`.
  - `GET /authentication/profile` returns `UserDto`.
- Why this matters:
  - Password hashes, email-verification tokens, and current/future seed material should not be exposed in normal player responses.
  - Returning the active server seed or future seed data can break provably-fair secrecy before reveal/rotation.
- Recommended fix:
  - Split request DTOs from response DTOs.
  - Introduce a sanitized `PublicUserDto` / `ProfileResponseDto`.
  - Remove `password`, `emailVerificationToken`, `futureServerSeed`, and unrevealed `serverSeed` from all player-facing responses.

### 2. Wallet APIs and DTOs cross the custody boundary
- Evidence:
  - `blockwinz-api/src/wallet/dtos/wallet.dto.ts`
  - `blockwinz-api/src/wallet/repositories/wallet.repository.ts`
  - `blockwinz-api/src/wallet/controllers/wallet.controller.ts`
- What is happening:
  - `WalletDto` includes `privateKey`.
  - `rowToWalletDto()` maps `row.privateKey` into the DTO.
  - `GET /wallet/getNewAddress` returns `Promise<WalletDto[]>`.
- Why this matters:
  - Private keys must never be part of a user-facing DTO contract.
  - Even if some code paths later strip fields, the DTO and controller surface make accidental leakage highly likely.
- Recommended fix:
  - Create separate internal and external wallet types.
  - Ensure all controller responses use a strictly public wallet shape.
  - Audit Swagger output to confirm private keys can never appear in generated API schemas.

### 3. Provably-fair secrecy is broken in active user/game state
- Evidence:
  - `blockwinz-api/src/authentication/repositories/authentication.repository.ts`
  - `blockwinz-api/src/core/fairLogic/repositories/fairLogic.repository.ts`
  - `blockwinz-api/src/core/seeds /repositories/seeds.repository.ts`
  - `blockwinz-api/src/core/seeds /dtos/seeds.dto.ts`
- What is happening:
  - Active seed DTOs include plain `serverSeed`.
  - `FairLogicRepository.generateRequestsToFairLogic()` and game services use `player.activeSeed.serverSeed`.
  - `updatePlayerNonce()` returns user state carrying `activeSeed.serverSeed` and `futureServerSeed`.
- Why this matters:
  - If the current or future server seed reaches client-visible state before reveal, outcomes can be predicted.
  - This is a direct fairness and financial integrity failure.
- Recommended fix:
  - Keep plain server seeds server-side only.
  - Expose only hashed verification fields for active/future seeds.
  - Restrict plain seed disclosure to settled history or post-rotation verification paths.

## High

### 4. Balance reservation is race-prone in withdrawals and betting
- Evidence:
  - `blockwinz-api/src/wallet/repositories/wallet.repository.ts`
  - `blockwinz-api/src/withdrawal/repositories/withdrawal.repository.ts`
  - `blockwinz-api/src/games/mines/mines.service.ts`
  - `blockwinz-api/src/games/tictactoe/tictactoe.service.ts`
- What is happening:
  - `lockWithdrawalFunds()` and `lockBetFunds()` read available balance first, then increment `pendingWithdrawal` / `lockedInBets`.
  - The update query does not enforce a conditional `WHERE` on remaining available funds and does not lock the row before reserving.
- Why this matters:
  - Two concurrent requests can both pass the balance check and reserve more than the wallet should allow.
- Recommended fix:
  - Move reservation into a single atomic SQL update with a balance predicate.
  - Consider row-level locking or a ledger/reservation table for stronger correctness.

### 5. Withdrawal processing is not end-to-end atomic
- Evidence:
  - `blockwinz-api/src/core/queue/processors/withdrawalQueue.processor.ts`
  - `blockwinz-api/src/wallet/repositories/wallet.repository.ts`
- What is happening:
  - On queue processing, chain send, transaction update, withdrawal status update, and release of reserved funds happen as separate steps.
  - `withdrawFunds()` checks against `pendingWithdrawal` and then debits app balance later.
- Why this matters:
  - Partial failure can leave inconsistent state between on-chain send, app balance, pending lock, and transaction records.
- Recommended fix:
  - Define a stricter withdrawal state machine.
  - Make post-send reconciliation idempotent.
  - Use explicit invariants for `appBalance`, `pendingWithdrawal`, and terminal withdrawal states.

### 6. JWT/config boot can silently degrade into unsafe defaults
- Evidence:
  - `blockwinz-api/src/authentication/repositories/authentication.repository.ts`
  - `blockwinz-api/src/main.ts`
  - `blockwinz-api/.env.example`
  - `blockwinz-FE/src/shared/constants/app.constant.ts`
  - `blockwinz-FE/src/vite-env.d.ts`
- What is happening:
  - API token signing falls back to `secret ?? ''`.
  - Frontend env values are cast directly from `import.meta.env` without runtime validation.
  - Example env files include secret-shaped values.
- Why this matters:
  - A bad deploy can boot with broken or dangerously weak auth/config.
  - Secret hygiene is poor enough to create operational and compliance risk.
- Recommended fix:
  - Add strict env schema validation at API and web startup.
  - Fail fast on missing required secrets/URLs.
  - Replace real-looking example secrets with obvious placeholders.

### 7. Protected routes in the player app do not actually block rendering
- Evidence:
  - `blockwinz-FE/src/guards/ProtectedRoutes.tsx`
  - `blockwinz-FE/src/App.tsx`
  - `blockwinz-FE/src/hooks/userAccount.ts`
  - `blockwinz-FE/src/hooks/useWalletState.ts`
- What is happening:
  - `ProtectedRoutes` always returns `<Outlet />`.
  - It opens the login modal in an effect, but protected pages and queries can mount first.
- Why this matters:
  - Logged-out users can briefly render protected screens and fire authenticated requests before auth state settles.
- Recommended fix:
  - Gate rendering on confirmed session state.
  - Return a loader or redirect/modal-only shell until auth bootstrap completes.

### 8. Production crash containment and observability are largely missing in the web app
- Evidence:
  - `blockwinz-FE/src/main.tsx`
  - `blockwinz-FE/package.json`
  - `blockwinz-FE/src/lib/socket.ts`
  - `blockwinz-FE/src/lib/axios.ts`
- What is happening:
  - No error boundary is mounted around the app.
  - No crash-reporting or monitoring SDK is present.
  - Most socket/network failures are only logged to console or shown as transient toasts.
- Why this matters:
  - A production crash can blank the SPA with no graceful recovery and no visibility into cause or scope.
- Recommended fix:
  - Add a top-level error boundary.
  - Instrument frontend errors, auth failures, wallet errors, and socket failures with centralized monitoring.

### 9. Refresh-cookie auth has no visible CSRF defense
- Evidence:
  - `blockwinz-api/src/authentication/services/refresh-token.service.ts`
  - `blockwinz-api/src/authentication/controllers/authentication.controller.ts`
  - `blockwinz-api/src/main.ts`
- What is happening:
  - The app relies on an `httpOnly` refresh cookie and allows cross-site credentials.
  - I did not find CSRF token enforcement, origin validation, or explicit anti-CSRF middleware usage on the refresh/logout session endpoints.
- Why this matters:
  - Cookie-based session endpoints are high-value CSRF targets if cross-site requests are permitted.
- Recommended fix:
  - Add explicit CSRF protection or strict origin validation for session-mutating cookie flows.

## Medium

### 10. Error handling often converts outages into silent empties
- Evidence:
  - `blockwinz-FE/src/hooks/useWalletState.ts`
  - `blockwinz-FE/src/hooks/useSeedPair.ts`
  - `blockwinz-FE/src/components/Wallet/components/Deposit.tsx`
  - `blockwinz-FE/src/pages/Transaction/Transactions.tsx`
  - `blockwinz-FE/src/pages/BetHistory/BetHistory.tsx`
- What is happening:
  - Wallet fetch returns `[]` on error.
  - Seed fetch/rotate suppresses detail.
  - Deposit errors leave an empty form plus a toast.
  - Transactions clear cache aggressively and do not set `totalCount` on success.
- Why this matters:
  - Backend outages can look like “no data” instead of “system unavailable,” which is dangerous in money flows.
- Recommended fix:
  - Introduce explicit error states, retry affordances, and “service unavailable” UX for account-critical views.

### 11. Logout route appears broken
- Evidence:
  - `blockwinz-FE/src/pages/Logout/Logout.tsx`
  - `blockwinz-FE/src/App.tsx`
- What is happening:
  - Logout navigates to `/login`, but there is no `/login` route in the router.
- Why this matters:
  - Users may land on a 404 or inconsistent post-logout state.
- Recommended fix:
  - Redirect to a valid public route and open the auth modal intentionally.

### 12. Seed rotation uses `GET` for a state-changing action
- Evidence:
  - `blockwinz-FE/src/hooks/useSeedPair.ts`
- What is happening:
  - `rotateSeedPair()` calls `GET /settings/rotateSeed`.
- Why this matters:
  - State-changing `GET` endpoints are unsafe for caches, prefetchers, and intermediaries.
- Recommended fix:
  - Use `POST` or `PATCH` for seed rotation and keep `GET` read-only.

### 13. Sensitive operational data is logged too freely
- Evidence:
  - `blockwinz-api/src/core/seeds /repositories/seeds.repository.ts`
  - `blockwinz-api/src/games/mines/mines.service.ts`
  - `blockwinz-api/src/shared/filters/fallback.filter.ts`
  - `blockwinz-FE/src/components/Chatwoot/Chatwoot.tsx`
- What is happening:
  - Seed creation logs the full request.
  - Game services log user IDs, bet data, and game state transitions.
  - Fallback filter logs raw exceptions.
  - Chatwoot token is hardcoded in the client bundle.
- Why this matters:
  - Logs and bundled config can become another leak path for sensitive operational data.
- Recommended fix:
  - Sanitize logs, remove hardcoded third-party tokens, and classify what may be logged in production.

### 14. Test coverage is far too thin for auth, wallet, and fairness-critical flows
- Evidence:
  - `blockwinz-api/package.json`
  - `blockwinz-api/src/games/coinflip/controllers/coinflip.controller.spec.ts`
  - `blockwinz-api/src/multiplayer/plugins/tictactoe-multiplayer.plugin.spec.ts`
  - `blockwinz-api/test/app.e2e-spec.ts`
  - `blockwinz-FE/package.json`
- What is happening:
  - API has minimal unit coverage and essentially no meaningful e2e coverage for auth, withdrawals, or wallet invariants.
  - Web tests are not configured.
- Why this matters:
  - The current codebase lacks regression protection in the areas most likely to cause irreversible production incidents.
- Recommended fix:
  - Add focused tests for auth/session flows, sanitized response contracts, withdrawal idempotency, concurrency safety, and guarded-route behavior.

### 15. Hosting hardening is inconsistent across platforms
- Evidence:
  - `blockwinz-FE/netlify.toml`
  - `blockwinz-FE/vercel.json`
- What is happening:
  - Netlify config includes baseline security headers and CSP.
  - Vercel config only rewrites routes.
- Why this matters:
  - Production protections may vary depending on host, leading to environment-specific exposure.
- Recommended fix:
  - Standardize response headers and deployment hardening across all supported hosts.

## Notable Strengths

- API uses `helmet`, CORS allowlisting, and global validation in `blockwinz-api/src/main.ts`.
- Refresh tokens are stored server-side in Redis and rotated in `blockwinz-api/src/authentication/services/refresh-token.service.ts`.
- Withdrawal requests use an idempotency header pattern through `blockwinz-api/src/shared/middlewares/idempotency.middleware.ts`.
- Frontend access JWTs are held in memory rather than localStorage in `blockwinz-FE/src/hooks/useAuth.ts`.
- Netlify deployment includes baseline security headers in `blockwinz-FE/netlify.toml`.

## Remediation Order

1. Remove all player-facing secret exposure from API DTOs and controller responses.
2. Fix fairness seed handling so active/future plain server seeds never leave trusted server code.
3. Rework wallet reservation and withdrawal invariants to be concurrency-safe and idempotent.
4. Fix protected-route rendering and post-logout behavior in the web app.
5. Add API/web startup env validation and clean all secret-shaped example config.
6. Add frontend error boundary and production monitoring for auth, wallet, and socket failures.
7. Replace silent empty-state failures with explicit degraded-service UX in account-critical views.
8. Add targeted tests for the critical paths above before shipping further changes.

## Suggested Immediate Containment

- Treat auth/profile and wallet response contracts as an emergency review.
- Audit whether Swagger, logs, or current production responses already expose `password`, `privateKey`, or plain seed values.
- Pause any release that includes provably-fair or wallet changes until response sanitization and fairness boundaries are fixed.
