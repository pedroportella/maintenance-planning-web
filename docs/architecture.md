# Architecture

The web repo is the planner-facing layer of the maintenance-planning showcase. It is intentionally API-driven: recommendation state, package decisions and operations posture belong to the API, while the workbench presents planner workflows over those contracts.

## Shape

- `apps/planner-workbench` hosts the Next.js App Router shell.
- `packages/services` holds API-facing contracts, mock adapters, backend adapters and response mappers.
- `packages/ui-tokens` holds typed visual primitives and CSS custom properties.
- `packages/ui-assets` holds neutral wordmark metadata, generic icon names and asset provenance notes.
- `packages/ui-library` holds reusable presentation primitives and the shared theme stylesheet entrypoint.
- `packages/utils` holds framework-neutral helpers such as planner route metadata.

## App Shell

The workbench currently renders local task routes for:

- work-order backlog;
- planning runs;
- recommendations;
- coordination exceptions;
- operations posture;
- scenario outcomes.

These screens are placeholders that prove navigation, layout and package resolution without introducing service calls.

## Visual System

The app imports the shared theme from `@maintenance-planning/ui-library/theme.css`. That stylesheet imports token custom properties from `@maintenance-planning/ui-tokens/theme.css`, then defines base element and shared component styling.

App-local CSS remains responsible for shell layout and route-specific composition. Brand text, generic icon names and provenance notes live in `packages/ui-assets`, keeping visual metadata out of route files.

## Runtime Boundary

The services package supports mock data for local frontend review and API-backed data when an endpoint is explicitly configured. Runtime selection is server-only:

- mock mode uses deterministic synthetic scenario fixtures;
- backend mode requires a configured API URL;
- production-like mock mode requires an explicit mock override.

Browser-visible source must not embed private backend origins. The current app shell still renders placeholder routes and does not call the services package from page code.
