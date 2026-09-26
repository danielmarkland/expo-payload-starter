FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/app ./apps/app
COPY packages/contracts ./packages/contracts
COPY packages/design-tokens ./packages/design-tokens
RUN pnpm install --frozen-lockfile
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG EXPO_PUBLIC_SITE_URL
ARG EXPO_PUBLIC_GTM_CONTAINER_ID
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_SITE_URL=$EXPO_PUBLIC_SITE_URL
ENV EXPO_PUBLIC_GTM_CONTAINER_ID=$EXPO_PUBLIC_GTM_CONTAINER_ID
RUN pnpm --filter @starter/app build

FROM nginx:1.29-alpine
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/app/dist /usr/share/nginx/html
EXPOSE 80
