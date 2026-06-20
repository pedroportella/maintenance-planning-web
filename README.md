# Maintenance Planning Web

Planner workbench foundation for a synthetic maintenance-planning showcase.

This repository hosts a React and Next.js workbench for planners who review work-order recommendations, schedule posture and decision history. The current implementation includes repo guardrails, a reusable component shell, a static synthetic coordination queue for local review, service-driven backlog, coordination exception, planning-run, recommendation, operations posture and scenario outcome screens, an internal UI-library evidence route, a typed service boundary that can run in deterministic mock mode or explicit backend mode, and a neutral visual foundation for the workbench.

## Boundary

- Uses synthetic data only.
- Presents a planner workbench, not a broad dashboard or field-worker app.
- Treats the API as the source of recommendation and decision truth.
- Does not require the API, simulator or cloud credentials for CI guardrails.
- Avoids hard-coded private backend origins in browser-visible code.

## Showcase Repos

This web workbench is one part of a three-repo synthetic maintenance-planning showcase:

- [maintenance-planning-api](https://github.com/pedroportella/maintenance-planning-api) owns persistence, planning recommendations, API contracts, operations posture, worker ingestion, replay and outbound events.
- [maintenance-data-simulator](https://github.com/pedroportella/maintenance-data-simulator) produces deterministic synthetic source-system-shaped data for local HTTP feed checks and explicit AWS EventBridge publish checks.
- [maintenance-planning-web](https://github.com/pedroportella/maintenance-planning-web) presents the planner journey over typed service adapters, using deterministic mock mode by default and server-side backend mode for API-backed review.

Reviewers can inspect this repo on its own through mock mode. Backend mode should only be used after the sibling API is running and seeded by the simulator, and backend origins must stay server-only.

For a whole-system local Docker recipe, see the [local Docker system runbook](https://github.com/pedroportella/maintenance-planning-api/blob/main/docs/local-docker-system.md).

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
- [Containerisation](docs/containerisation.md)
- [Guardrails](docs/guardrails.md)
- [Reviewer pack](docs/reviewer-pack.md)
- [Reviewer runbook](docs/reviewer-runbook.md)
- [Future hardening](docs/future-hardening.md)

## Commands

```sh
pnpm guard
pnpm check
pnpm test:links
pnpm test:e2e:mock
pnpm test:reviewer-pack
pnpm test:visual:showcase
pnpm container:build
pnpm container:smoke
cp .env.local.example .env.local
pnpm test:e2e:backend
pnpm guard:browser-bundle
pnpm test:reviewer-evidence
pnpm verify
```

The `lint`, `typecheck`, `test` and `build` commands are workspace-aware. The app, services and visual-system packages own executable checks; utility-only packages stay thin source boundaries until they need package-local tests. The reviewer-pack screenshot workflow writes ignored screenshots to `test-results/reviewer-pack`. The showcase visual smoke starts the workbench in mock mode and checks `/ui-library` across desktop and mobile viewports. The post-build browser-bundle guard checks generated app assets for private backend origins. The container smoke builds the standalone Next.js runtime image, starts it in explicit mock mode and checks planner routes plus `/health/live`. The backend end-to-end smoke is optional and reads local backend settings from `.env.local` or process environment variables. It expects a local API that has already received a deterministic simulator scenario.
