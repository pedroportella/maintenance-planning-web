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
pnpm test:links
pnpm build
pnpm test:e2e:mock
pnpm test:reviewer-evidence
pnpm verify
```

The local checks do not require the API, simulator or cloud credentials.

The mock end-to-end smoke starts the workbench locally and verifies that the planner shell and route navigation render.
