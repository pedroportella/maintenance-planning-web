# Planner Workbench App

Next.js application shell for the planner workbench.

The app focuses on planner task routes for synthetic maintenance-planning review flows. It renders a compact workbench start page, service-driven recommendation, work-order triage, coordination exception, planning-run, operations posture and scenario outcome routes. The `/ui-library` route is an internal reviewer and developer evidence page for reusable component states.

The app imports shared theme styles from `@maintenance-planning/ui-library/theme.css`. App-local global CSS should stay focused on route composition; reusable shell, table, status, alert and state styling belongs to the UI library.

```sh
pnpm --dir apps/planner-workbench dev
pnpm --dir apps/planner-workbench lint
pnpm --dir apps/planner-workbench typecheck
pnpm --dir apps/planner-workbench test
pnpm --dir apps/planner-workbench build
pnpm container:smoke
pnpm test:reviewer-pack
pnpm test:visual:showcase
pnpm test:e2e:backend
```

The app defaults to mock mode for local UI review. The reviewer-pack screenshot workflow captures current planner and evidence surfaces under ignored test output. The container smoke packages the app as a standalone Next.js runtime and checks the health route plus key planner surfaces in explicit mock mode. Backend mode is server-only and is exercised through the repo-level backend end-to-end smoke after the local API has been seeded with deterministic simulator data. Copy the repo root `.env.local.example` to `.env.local` when the backend smoke needs local API settings.

See the repo [architecture](../../docs/architecture.md), [API integration](../../docs/api-integration.md) and [containerisation](../../docs/containerisation.md) notes.
