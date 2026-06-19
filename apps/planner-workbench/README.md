# Planner Workbench App

Next.js application shell for the planner workbench.

The app focuses on planner task routes for synthetic maintenance-planning review flows. It renders a local shell with a static coordination queue on the first screen, service-driven backlog, planning-run and recommendation routes, and thin route shells for coordination exceptions, operations posture and scenario outcomes.

The app imports shared theme styles from `@maintenance-planning/ui-library/theme.css`. App-local global CSS should stay focused on route composition; reusable shell, table, status, alert and state styling belongs to the UI library.

```sh
pnpm --dir apps/planner-workbench dev
pnpm --dir apps/planner-workbench lint
pnpm --dir apps/planner-workbench typecheck
pnpm --dir apps/planner-workbench test
pnpm --dir apps/planner-workbench build
```

See the repo [architecture](../../docs/architecture.md) and [API integration](../../docs/api-integration.md) notes.
