ARG NODE_VERSION=22.18.0
ARG PNPM_VERSION=10.18.3

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/planner-workbench/package.json apps/planner-workbench/package.json
COPY packages/services/package.json packages/services/package.json
COPY packages/ui-assets/package.json packages/ui-assets/package.json
COPY packages/ui-library/package.json packages/ui-library/package.json
COPY packages/ui-tokens/package.json packages/ui-tokens/package.json
COPY packages/utils/package.json packages/utils/package.json

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

COPY . .

RUN pnpm guard \
  && pnpm lint \
  && pnpm typecheck \
  && pnpm test \
  && pnpm build \
  && pnpm guard:browser-bundle \
  && pnpm test:reviewer-evidence \
  && mkdir -p apps/planner-workbench/public

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app

ARG IMAGE_REPOSITORY=maintenance-planning-web
ARG VCS_REF=local
ARG BUILD_DATE=unknown

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

LABEL org.opencontainers.image.title="maintenance-planning-web" \
      org.opencontainers.image.description="Review web runtime image for synthetic maintenance-planning planner workflows." \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.source="${IMAGE_REPOSITORY}"

RUN groupadd --gid 10001 planner \
  && useradd --uid 10001 --gid 10001 --home-dir /app --shell /usr/sbin/nologin planner \
  && chown -R 10001:10001 /app

COPY --from=build --chown=10001:10001 /workspace/apps/planner-workbench/.next/standalone ./
COPY --from=build --chown=10001:10001 /workspace/apps/planner-workbench/.next/static ./apps/planner-workbench/.next/static
COPY --from=build --chown=10001:10001 /workspace/apps/planner-workbench/public ./apps/planner-workbench/public

WORKDIR /app/apps/planner-workbench
USER 10001:10001

EXPOSE 8080

CMD ["node", "server.js"]
