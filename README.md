# BlockWinz monorepo

pnpm workspaces + [Turborepo](https://turbo.build/repo) for the BlockWinz apps.

## Prerequisites

- Node.js 22+
- [Corepack](https://nodejs.org/api/corepack.html): `corepack enable` (ships with Node)

## Install

```bash
pnpm install
```

`prepare` creates `blockwinz-api/packages` → `../packages` (a symlink). Nest’s Swagger compiler plugin resolves `@blockwinz/shared` enums to `require("../../../../packages/shared/dist/index")` in compiled JS; from `dist/src/...` that must resolve under `blockwinz-api/`, so this symlink makes that path valid. Run `node scripts/ensure-blockwinz-api-packages-symlink.mjs` if you clone without `prepare`.

The root `package.json` pins `@types/react` / `@types/react-dom` to v18 via `pnpm.overrides` so `@blockwinz/web` (React 18) does not pick up React 19 types from `@blockwinz/admin` in the shared lockfile.


## Common commands

| Goal | Command |
|------|---------|
| Dev (all apps) | `pnpm dev` — runs `@blockwinz/shared` `build` once, then `tsup --watch` with API/web/admin; API and web start after shared `dist` exists |
| Dev one app | `pnpm dev:api` / `pnpm dev:web` / `pnpm dev:admin` |
| API + shared only | `pnpm dev:api:shared` — same shared watch + API without web/admin; **restart the API** (or save an API file) after shared changes if hot reload misses updates (Node caches `require`) |
| Build (all) | `pnpm build` |
| Build one app | `pnpm build:api` / `pnpm build:web` / `pnpm build:admin` |
| Shared package + API DTO `.d.ts` emit | `pnpm --filter @blockwinz/shared build` then `pnpm build:generated` ([packages/shared/README.md](packages/shared/README.md)) |
| Lint (all) | `pnpm lint` |
| Format (API Prettier) | `pnpm format` |
| Tests (all) | `pnpm test` |
| API tests | `pnpm test:api`, `pnpm test:api:watch`, `pnpm test:api:cov`, `pnpm test:api:e2e` |
| Web production preview | `pnpm preview:web` (builds web first) |
| Run built API / admin | `pnpm start:api`, `pnpm start:admin` |
| Drizzle (API) | `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio` |
| Seed DB (admin + general room) | `pnpm seed` |
| Docker Compose | `pnpm compose:up`, `pnpm compose:up:detached`, `pnpm compose:down` |
| One-off turbo filter | `pnpm exec turbo run build --filter=@blockwinz/web` |

### Package names

| Folder | Package |
|--------|---------|
| `blockwinz-api` | `@blockwinz/api` |
| `blockwinz-FE` | `@blockwinz/web` |
| `blockwinz-admin` | `@blockwinz/admin` |
| `packages/shared` | `@blockwinz/shared` (enums + shared runtime; `generated/` = DTO types from API) |

## Backend (Docker)

From the **repository root** (copy [`.env.example`](.env.example) to `.env` first):

```bash
docker compose up --build
```

The API image uses Turborepo `turbo prune` inside [`blockwinz-api/Dockerfile`](blockwinz-api/Dockerfile). More detail: [blockwinz-api/README.md](blockwinz-api/README.md).

## Deploy / hosting

- **GitHub Actions**: workflows live in [`.github/workflows/`](.github/workflows/). EC2 deploy clones the monorepo to `~/app` and runs `docker-compose` from that root (where [`docker-compose.yml`](docker-compose.yml) lives). The clone URL assumes a repo named **`blockwinz`**; change the workflow if yours differs.
- **Netlify (`blockwinz-FE`)**: set **Base directory** to `blockwinz-FE`, install command `corepack enable && pnpm install`, build command `pnpm run build`.
- **Vercel (`blockwinz-admin`)**: set **Root Directory** to `blockwinz-admin`, install `pnpm install`, build `pnpm run build`.

## Git hooks

[Husky](https://typicode.github.io/husky/) runs at the repo root (`.husky/pre-push` runs `pnpm exec turbo run build`).

## AI assistants

Coding patterns and conventions for assistants are documented in [`.cursor/commands/mcp-template.md`](.cursor/commands/mcp-template.md).
