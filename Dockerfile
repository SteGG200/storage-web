ARG NODE_VERSION=26.5.0
FROM node:${NODE_VERSION}-alpine3.24 AS base

FROM base AS build-stage

RUN apk add --no-cache libc6-compat && \
	npm install -g pnpm@latest

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=${SERVER_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS production-stage

RUN addgroup -S storage-web && \
	adduser -G storage-web -S storage-web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

RUN mkdir .next
RUN chown storage-web:storage-web .next

COPY --from=build-stage /app/public ./public
COPY --from=build-stage --chown=storage-web:storage-web /app/.next/standalone .
COPY --from=build-stage --chown=storage-web:storage-web /app/.next/static ./.next/static

USER storage-web

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
