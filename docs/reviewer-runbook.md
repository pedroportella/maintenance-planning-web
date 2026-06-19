# Reviewer Runbook

Use this runbook to inspect the repo foundation.

## Prerequisites

- Node.js 22.
- pnpm through Corepack or an equivalent local install.

## Commands

```sh
pnpm install
pnpm guard
pnpm check
pnpm --filter @maintenance-planning/services check
pnpm --filter @maintenance-planning/ui-tokens check
pnpm --filter @maintenance-planning/ui-assets check
pnpm --filter @maintenance-planning/ui-library check
pnpm test:links
pnpm build
pnpm test:e2e:mock
pnpm test:reviewer-evidence
pnpm verify
```

The local checks do not require the API, simulator or cloud credentials.

The mock end-to-end smoke starts the workbench locally and verifies that the planner shell, synthetic coordination queue and route navigation render.

The services package check verifies runtime mode selection, deterministic synthetic fixtures and backend adapter calls against typed contracts.

The visual package checks verify token exports, theme custom properties, contrast-sensitive pairs, neutral asset metadata, shared component markup and the shared theme stylesheet entrypoint.
