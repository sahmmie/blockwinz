These instructions apply when answering questions about this repository, generating code, or proposing changes. **This file is the single source of truth** for BlockWinz coding patterns and assistant behavior.

# BlockWinz engineering handbook

BlockWinz is a **pnpm workspaces** monorepo orchestrated with **Turborepo**. Packages:

| Directory        | Package           | Role                          |
| ---------------- | ----------------- | ----------------------------- |
| `blockwinz-api`  | `@blockwinz/api`  | NestJS API, Drizzle, REST     |
| `blockwinz-FE`   | `@blockwinz/web`  | Vite + React 18 player client |
| `blockwinz-admin`| `@blockwinz/admin`| Next.js admin app             |

---

## Prerequisites and tooling

- **Node.js 22+**
- **Corepack** enabled so the pinned **pnpm** version from the root `package.json` is used (`corepack enable`).
- **Docker**: optional; root `docker-compose.yml` and API Dockerfile support local/backend runs (see root [`README.md`](../../README.md)).

Prefer **repository commands** over ad-hoc paths:

| Goal              | Command (from repo root) |
| ----------------- | ------------------------ |
| Dev all apps      | `pnpm dev`               |
| Dev API / web / admin | `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:admin` |
| Build all         | `pnpm build`             |
| Lint all          | `pnpm lint`              |
| Format (API Prettier via turbo) | `pnpm format` |
| API unit tests    | `pnpm test:api` (and `:watch`, `:cov`) |
| API e2e           | `pnpm test:api:e2e`      |
| Drizzle (API)     | `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio` |
| Seed              | `pnpm seed`              |
| Docker Compose    | `pnpm compose:up`, `pnpm compose:down` |

**Git hooks**: Husky runs at the repo root; pre-push triggers `pnpm exec turbo run build`. Do not bypass without reason.

---

## `@blockwinz/api` (NestJS + Drizzle)

### Architecture (target layering)

- **REST API** with **Swagger** (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.).
- **JWT**-protected routes use **`AuthenticationGuard`**, **`@CurrentUser()`**, and helpers like `getUserId` / `getProfileId` from `src/shared/helpers/user.helper`.
- **Default flow**: **`Controller` → `Service` → `Repository`**.
  - **`Controller`**: HTTP concerns only—route params, DTO validation, Swagger, guards/interceptors. Delegate to a **service** for behavior.
  - **`Service`**: Application logic—rules, `BadRequestException` / `NotFoundException` (and related Nest HTTP exceptions), orchestration across repositories, **owning `db.transaction()`** when several writes must commit together, passing **`tx?: DrizzleDb`** into repositories inside that callback.
  - **`Repository`**: **Persistence only**—Drizzle queries, optional `tx`, row → DTO (or typed row) mapping with existing `toXxxDto` / `rowToDto` style in that module.
- **Game features** under `games/*` follow the same pattern: a `*.service.ts` owns fairness, wallet, transactions, and bet-history orchestration; a slim `repositories/*.repository.ts` handles inserts/updates/selects for that game’s tables (e.g. dice, limbo, plinko, wheel, keno, tictactoe, mines). The **coinflip** module is currently a stub (empty repository) until implemented.
- **Drizzle** is provided via the `DRIZZLE` injection token (`src/database/constants.ts`) and typed as `DrizzleDb` from `src/database/database.module.ts`.
- **Schemas** live under `src/database/schema/`; feature-specific Drizzle schema fragments may appear under a feature’s `schemas/` folder where present.

### Database access and transactions

- **Scope queries** to the right user, profile, game, or resource with explicit `where` clauses, following existing modules.
- Repositories keep **`getDb(tx?: DrizzleDb)`** (or equivalent) and accept **`tx`** from callers; **services** start transactions for multi-step flows and pass `tx` down. **New code** should follow that split.

### DTOs, enums, and mapping

- Use **DTOs** under feature `dtos/` and shared DTOs under `src/shared/dtos/`.
- Prefer **shared enums** (e.g. `src/shared/enums/`) over raw string literals for stable domain values; align with existing enums before adding new ones.
- Repositories often map DB rows to DTOs with **`toXxxDto`**-style helpers—stay consistent with the module you edit.

### Module registration

- Register **controllers**, **services**, and **repositories** in the feature `*.module.ts`.
- **Export** repositories (and services when needed) so other modules can inject them—e.g. game flows may inject `BetHistoryRepository` for writes inside a transaction while HTTP routes use `BetHistoryService` for reads.

### Naming

- **Follow neighboring code** in the same feature: naming mixes `get*`, `find*`, and list helpers—match the style of the files you edit.

### Public vs internal routes

- Use **`@Public()`** (or equivalent reflector metadata) where the codebase marks routes that skip auth—mirror existing guards and decorators.

---

## `@blockwinz/web` (Vite + React 18)

- **UI**: Chakra UI v3, Emotion, Framer Motion where already used.
- **Data**: TanStack React Query for server state; **Zustand** and React context for local/UI state; **axios** for HTTP.
- **Realtime**: `socket.io-client` with shared context (e.g. `context/socketContext.tsx`).
- **Structure**: `pages/`, `components/`, `casinoGames/<game>/` (hooks, components, types), `shared/` (constants, enums, utils, types), `themes/`, `guards/`. **New game or page code** should mirror the closest existing game or page folder layout.
- **Exports**: ESLint may warn on anonymous default exports for components (`react-refresh/only-export-components`). Prefer patterns already used in the same directory (named exports vs default where consistent).

---

## `@blockwinz/admin` (Next.js)

- **UI**: Radix-based / shadcn-style components, Tailwind patterns as in existing files.
- **Forms**: react-hook-form + resolvers where used elsewhere in the app.
- Follow the **routing conventions** already used in `blockwinz-admin` (App Router or Pages) within each feature.

---

## Quality bar

- **Lint**: `pnpm lint` at root runs turbo pipelines per package; fix new issues in touched files.
- **Format**: API sources use Prettier (`pnpm format`); match `.prettierrc` in `blockwinz-api` (e.g. single quotes, trailing commas).
- **Tests**: Prefer adding or updating tests under `blockwinz-api` when changing critical logic; web/admin may still use placeholder `test` scripts—follow existing practice per package.
- **Type safety**: Preserve strict TypeScript usage; avoid `any` unless the file already uses it for a clear reason.

---

## Commits and PRs

- **Conventional commits** are recommended: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, optional scope (`api`, `web`, `admin`, `repo`).
- **PR descriptions**: Cursor command [`.cursor/commands/gen-pr.md`](./gen-pr.md) and workflow `.agent/workflows/generate-pr.md` describe generating `PR.md` at the repo root from the current branch and diff.
- **Ticket IDs**: if the branch includes a ticket (e.g. `feature/BWZ-123-short-desc`), use that id in the PR title template; replace with your tracker’s prefix if different.

---

## How assistants should work in this repo

1. **Search and read this codebase** (semantic search, grep, reading files) and align answers with what is already here.
2. **Apply this document** for architecture and style when implementing or reviewing.
3. **Keep changes minimal** and consistent with the surrounding module.
4. For **unclear product behavior**, infer from tests and existing flows in this repo.

---

## Related paths

- Root overview: [`README.md`](../../README.md)
- API details: [`blockwinz-api/README.md`](../../blockwinz-api/README.md)
- PR template command: [`.cursor/commands/gen-pr.md`](./gen-pr.md)
- Commit message command: [`.cursor/commands/gen-commit-msg.md`](./gen-commit-msg.md)
