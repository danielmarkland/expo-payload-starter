FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/site ./apps/site
COPY packages/design-tokens ./packages/design-tokens
RUN pnpm install --frozen-lockfile
ARG SITE_URL
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV PAYLOAD_SECRET=build-time-placeholder-secret-at-least-32-characters
ENV SITE_URL=$SITE_URL
RUN pnpm --filter @starter/site build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /workspace/apps/site/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /workspace/apps/site/.next/static ./apps/site/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/site/server.js"]
