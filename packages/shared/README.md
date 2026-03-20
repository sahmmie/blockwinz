# `@blockwinz/shared`

Two layers:

1. **Hand-written** (`src/` → `dist/`) — TypeScript **enums** (single source of truth), `HttpError`, Zod helpers, money helpers. Drizzle `pgEnum` in the API uses `Object.values(YourEnum)` via `pgEnumValues` — no duplicated `as const` string lists.

2. **Generated** (`generated/`) — declaration-only emit from `@blockwinz/api` DTOs. No JavaScript at runtime.

## Build

```bash
pnpm --filter @blockwinz/shared build
```

## Regenerate API contract types

From repo root (runs `tsc -p tsconfig.contracts.json` + barrel script):

```bash
pnpm build:generated
```

Requires `@blockwinz/shared` to be built first (`dist/` exists) so `tsc` can resolve imports.

## Usage

```ts
import { Currency, DbGameSchema, currencySchema } from '@blockwinz/shared';
import type { WalletDto } from '@blockwinz/shared/generated';
```

Always use `import type` for `./generated` so bundlers do not expect JS for that subpath.

## Caveats (generated DTO types)

- Emitted types describe **classes**; JSON responses are structurally compatible when you use `import type`.
- Some DTO `.d.ts` files may reference Nest/class-validator types. If the web build fails on missing types, add the needed `@types/*` devDependencies or narrow imports on the API side.
- **UI-only games**: `GameTypeEnum` can list titles not yet in `DbGameSchema` (not persisted). Use `DbGameSchema` for payloads that must round-trip the database.
