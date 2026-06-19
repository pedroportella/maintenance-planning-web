# Maintenance Planning Web

Planner workbench foundation for a synthetic maintenance-planning showcase.

This repository hosts a React and Next.js workbench for planners who review API-backed work-order recommendations, schedule posture and decision history. The current implementation includes repo guardrails, a local App Router shell and a typed service boundary that can run in deterministic mock mode or explicit backend mode.

## Boundary

- Uses synthetic data only.
- Presents a planner workbench, not a broad dashboard or field-worker app.
- Treats the API as the source of recommendation and decision truth.
- Does not require the API, simulator or cloud credentials for CI guardrails.
- Avoids hard-coded private backend origins in browser-visible code.

## Workspace

- [apps/planner-workbench](apps/planner-workbench/README.md) - Next.js app shell for the planner workbench.
- [packages/services](packages/services/README.md) - typed API contracts, mock fixtures and backend service boundary.
- [packages/ui-assets](packages/ui-assets/README.md) - static visual assets owned by the web repo.
- [packages/ui-library](packages/ui-library/README.md) - shared UI components.
- [packages/ui-tokens](packages/ui-tokens/README.md) - design tokens.
- [packages/utils](packages/utils/README.md) - shared web utilities.

## Docs

- [Architecture](docs/architecture.md)
- [API integration](docs/api-integration.md)
- [Guardrails](docs/guardrails.md)
- [Reviewer runbook](docs/reviewer-runbook.md)
- [Future hardening](docs/future-hardening.md)

## Commands

```sh
pnpm guard
pnpm check
pnpm test:links
pnpm test:e2e:mock
pnpm test:reviewer-evidence
pnpm verify
```

The `lint`, `typecheck`, `test` and `build` commands are workspace-aware. The app and services package own executable checks; remaining shared packages stay thin source boundaries.
