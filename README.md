# Maintenance Planning Web

Planner workbench foundation for a synthetic maintenance-planning showcase.

This repository will host a React and Next.js workbench for planners who review API-backed work-order recommendations, schedule posture and decision history. The current implementation is a repo foundation: workspace boundaries, public docs, guard scripts and CI wiring are in place before feature screens are added.

## Boundary

- Uses synthetic data only.
- Presents a planner workbench, not a broad dashboard or field-worker app.
- Treats the API as the source of recommendation and decision truth.
- Does not require the API, simulator or cloud credentials for CI guardrails.
- Avoids hard-coded private backend origins in browser-visible code.

## Workspace

- [apps/planner-workbench](apps/planner-workbench/README.md) - future Next.js app shell for the planner workbench.
- [packages/services](packages/services/README.md) - API client and mock-service boundary.
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
pnpm test:links
pnpm test:reviewer-evidence
pnpm verify
```

The `lint`, `typecheck`, `test` and `build` commands are workspace-aware. They skip cleanly until individual app or package scripts are introduced.
