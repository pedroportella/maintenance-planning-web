# Planner Workbench App

Next.js application shell for the planner workbench.

The app focuses on planner task routes for synthetic maintenance-planning review flows. It renders a compact workbench start page, service-driven recommendation, work-order triage, coordination exception, planning-run, operations posture and scenario outcome routes through the shared Radix-backed planner adapter system. The `/ui-library` route is an internal reviewer and developer evidence page for reusable component states.

The app imports shared theme styles from `@maintenance-planning/ui-library/theme.scss`. App-local global CSS should stay focused on route handoff; reusable shell, table, status, alert, form and workflow styling belongs to the UI library.

## Local Mock Development

Run from the repository root:

```sh
pnpm install
pnpm --dir apps/planner-workbench dev
```

Open `http://localhost:3000`. The app defaults to mock mode for local UI review, so this path does not require Docker, the API, the simulator or `.env.local`.

Useful local checks:

```sh
pnpm --filter @maintenance-planning/planner-workbench check
pnpm test:e2e:mock
pnpm test:reviewer-pack
pnpm test:visual:library
pnpm test:visual:showcase
```

The library visual smoke checks only the `/ui-library` baselines. The reviewer-pack screenshot workflow captures current planner and evidence surfaces under ignored test output. Container smoke and backend mode are optional repo-level checks for packaging and API-backed review. Backend mode is server-only and is exercised after the local API has been seeded with deterministic simulator data. Copy the repo root `.env.local.example` to `.env.local` only when the backend smoke needs local API settings.

See the repo [architecture](../../docs/architecture.md), [API integration](../../docs/api-integration.md) and [containerisation](../../docs/containerisation.md) notes.
