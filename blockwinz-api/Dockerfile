# Build context must be the monorepo root.

FROM node:22-alpine AS base
RUN apk add --no-cache \
    bash \
    dumb-init \
    python3 \
    make \
    g++ \
    build-base \
    libc6-compat \
    && rm -rf /var/cache/apk/*
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.5.4 prune @blockwinz/api --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm exec turbo run build --filter=@blockwinz/api

FROM base AS development
COPY --from=installer /app /app
WORKDIR /app/blockwinz-api
EXPOSE 7979 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "run", "dev"]

FROM base AS production
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod
COPY --from=installer /app/blockwinz-api/dist ./blockwinz-api/dist
WORKDIR /app/blockwinz-api
EXPOSE 7979 8080
ENTRYPOINT ["dumb-init", "--"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1
CMD ["node", "dist/src/main"]
