# UI Library Package

Boundary for shared React components and their theme entrypoint.

Components should be compact, accessible and suited to repeated planner workflows rather than marketing presentation.

## Exports

- `@maintenance-planning/ui-library` exports shared React primitives.
- `@maintenance-planning/ui-library/theme` exports theme metadata for tests and docs.
- `@maintenance-planning/ui-library/theme.scss` imports Radix Themes CSS, maps token custom properties and defines base component styling.

Apps should import the theme stylesheet from this package before app-owned layout styles.
The package is Sass-first and does not publish a generated `theme.css` artifact.

## Component Boundary

The package owns reusable presentation components through architecture-aligned families:
`PlannerAppLayout`, `PlannerPage`, `PlannerPageHeader`, `PlannerStatusBadge`,
`PlannerMetricSummary`, `PlannerDataTable`, `PlannerFilterToolbar`,
`PlannerPagination`, `PlannerDecisionPanel`, `PlannerEmptyState`, `PlannerAlert`,
`PlannerSegmentedNav` and `PlannerLoadingState`.

Component family source lives under `src/components`, grouped by role as `data`,
`feedback`, `forms`, `layout`, `radix` and `workflow`. Theme code stays under
`src/theme`; shared non-visual helpers stay under `src/utils`. Direct Radix
imports belong inside the local adapter/theme boundary, not planner route
containers.

It should not own API calls, scoring rules, simulator behavior or planner decision logic.

## Reviewer Evidence

The planner workbench `/ui-library` route is the public review surface for this
package. It exercises theme modes, reusable layout/status/table/form states and
constrained decision controls in deterministic mock mode.

Use the focused visual smoke after intentional UI-library changes:

```sh
pnpm test:visual:library
```

Route-wide visual evidence lives in the app showcase smoke. Keep this package
focused on reusable component semantics and Sass theme behavior.
