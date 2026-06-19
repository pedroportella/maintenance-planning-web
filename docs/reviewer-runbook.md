# Reviewer Runbook

Use this runbook to inspect the repo foundation.

## Prerequisites

- Node.js 22.
- pnpm through Corepack or an equivalent local install.

## Commands

```sh
pnpm install
pnpm guard
pnpm test:links
pnpm test:reviewer-evidence
pnpm verify
```

The foundation checks do not require the API, simulator or cloud credentials.

The workspace `lint`, `typecheck`, `test` and `build` commands skip cleanly until feature packages add their own scripts.
