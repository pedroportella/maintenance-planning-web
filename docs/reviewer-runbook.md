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

The mock end-to-end smoke starts the workbench locally, verifies the planner shell, reviews coordination exceptions, operations posture and scenario outcomes, opens the recommendation workbench, records a mock planner decision, then checks planning-run detail and backlog state.

The services package check verifies runtime mode selection, deterministic synthetic fixtures, operations posture mapping, scenario outcome summaries, mock decision recording and backend adapter calls against typed contracts.

The visual package checks verify token exports, theme custom properties, contrast-sensitive pairs, neutral asset metadata, shared component markup and the shared theme stylesheet entrypoint.
