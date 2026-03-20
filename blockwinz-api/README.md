<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

BlockWinz API is a comprehensive gaming/betting platform built with NestJS. The platform provides a robust backend system for managing games, user transactions, and betting operations.

### Core Features
- Authentication system for user management
- Wallet system for handling transactions
- Games module for managing different games
- Bet history tracking
- Referral system for user acquisition
- Transaction management
- Email via **Mailgun** (queued with Bull)
- Settings management

### Technical Architecture
- Built with NestJS framework
- **PostgreSQL** for data storage with **Drizzle ORM** (schema and migrations in `src/database/`).
- Implements JWT authentication
- Has middleware and interceptors for request processing
- Uses decorators for custom functionality
- Implements filters for error handling

### Main Modules
- `authentication/`: Handles user authentication and profiles
- `wallet/`: Manages user balances and transactions
- `games/`: Controls game-related functionality
- `betHistory/`: Tracks user betting history
- `referral/`: Manages user referral system
- `transaction/`: Handles financial transactions
- `email/`: Manages email communications
- `settings/`: Handles system configuration

### Security Features
- Authentication guards
- Request interceptors
- Error filters
- Middleware for request processing

### Shared Components
- Common utilities and services
- Shared DTOs and interfaces
- Reusable decorators

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

## Database

The API uses **PostgreSQL** with **Drizzle ORM**. Schema and migrations live under `src/database/schema/`.

**Environment variables (PostgreSQL):**

- **`DATABASE_URL`** – full connection string (recommended). Use your **Supabase** URI from *Project Settings → Database* (typically `sslmode=require`). For serverless/pooled access, use Supabase’s pooler URL when the driver supports it.
- **Fallback** (only if `DATABASE_URL` is unset): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_DB`, `DATABASE_PORT` – assembled into a URL by the app (see `database.module.ts`).

**Commands:**

```bash
# Generate migrations from schema changes
$ npm run db:generate

# Apply migrations
$ npm run db:migrate

# Push schema directly (dev)
$ npm run db:push

# Open Drizzle Studio
$ npm run db:studio
```

**Seed data (not automatic):** After `db:push` / `db:migrate`, create the default admin (when `DEFAULT_ADMIN_EMAIL` is set) and the `general` chat room:

```bash
# from monorepo root
pnpm seed
```

**Docker Compose** at the repo root runs **API + Redis**. PostgreSQL is external; set **`DATABASE_URL`** in `blockwinz-api/.env`. Set **`REDIS_URL`** when the API runs outside Compose (e.g. `redis://localhost:6379`).

## Email (Mailgun)

Transactional email uses the **Mailgun** HTTP API (not SMTP). Configure:

- `MAILGUN_API_KEY` – from Mailgun → Sending → domain → API keys  
- `MAILGUN_DOMAIN` – e.g. `mg.yourdomain.com`  
- `MAILGUN_FROM` – sender (must be allowed on that domain)  
- `MAILGUN_API_URL` – optional; use `https://api.eu.mailgun.net` for EU infrastructure (default US: `https://api.mailgun.net`)

## Docker

The API image is built from the **monorepo root** (Turborepo prune + pnpm):

```bash
# cwd = repository root
docker build -f blockwinz-api/Dockerfile -t blockwinz-api --target production .
```

## Docker Compose

[`docker-compose.yml`](../docker-compose.yml) is at the **monorepo root** (API + Redis). From the repository root:

```bash
docker compose up --build
docker compose up -d --build
```

> When you run `docker compose up` during development, it may also pick up `docker-compose.override.yml` if present.

> For production (`NODE_ENV=production`), build targets the `production` stage; use `docker compose -f docker-compose.yml up -d --build` as needed.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).