# UI Tokens Package

Boundary for shared design tokens and theme custom properties.

Tokens should support a restrained operational interface with clear contrast, stable spacing and predictable states.

## Exports

- `@maintenance-planning/ui-tokens` exports typed color, spacing, radius, typography, shadow and status tone tokens.
- `@maintenance-planning/ui-tokens/theme.css` exposes the CSS custom properties consumed by the UI-library theme.

The package owns contrast-critical token tests so downstream components can reuse the palette without re-checking every primitive pair.
