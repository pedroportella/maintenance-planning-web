# Maintenance Planning Web

Planner workbench foundation for a synthetic maintenance-planning showcase.

This repository hosts a React and Next.js workbench for planners who review work-order recommendations, schedule posture and decision history. The current implementation includes repo guardrails, a reusable component shell, a static synthetic coordination queue for local review, a typed service boundary that can run in deterministic mock mode or explicit backend mode, and a neutral visual foundation for the workbench.

## Boundary

- Uses synthetic data only.
- Presents a planner workbench, not a broad dashboard or field-worker app.
- Treats the API as the source of recommendation and decision truth.
- Does not require the API, simulator or cloud credentials for CI guardrails.
- Avoids hard-coded private backend origins in browser-visible code.

## Workspace

- [apps/planner-workbench](apps/planner-workbench/README.md) - Next.js app shell for the planner workbench.
- [packages/services](packages/services/README.md) - typed API contracts, mock fixtures and backend service boundary.
- [packages/ui-assets](packages/ui-assets/README.md) - neutral wordmark, icon metadata and asset provenance notes.
- [packages/ui-library](packages/ui-library/README.md) - shared UI components and theme stylesheet entrypoint.
- [packages/ui-tokens](packages/ui-tokens/README.md) - typed design tokens and CSS custom properties.
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

The `lint`, `typecheck`, `test` and `build` commands are workspace-aware. The app, services and visual-system packages own executable checks; utility-only packages stay thin source boundaries until they need package-local tests.
