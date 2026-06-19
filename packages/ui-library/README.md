# UI Library Package

Boundary for shared React components and their theme entrypoint.

Components should be compact, accessible and suited to repeated planner workflows rather than marketing presentation.

## Exports

- `@maintenance-planning/ui-library` exports shared React primitives.
- `@maintenance-planning/ui-library/theme` exports theme metadata for tests and docs.
- `@maintenance-planning/ui-library/theme.css` imports token custom properties and defines base component styling.

Apps should import the theme stylesheet from this package before app-owned layout styles.
