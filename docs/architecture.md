# Architecture

The web repo is the planner-facing layer of the maintenance-planning showcase. It is intentionally API-driven: recommendation state, package decisions and operations posture belong to the API, while the workbench presents planner workflows over those contracts.

## Shape

- `apps/planner-workbench` hosts the Next.js App Router shell.
- `packages/services` holds API-facing contracts, mock adapters, backend adapters and response mappers.
- `packages/ui-library`, `packages/ui-tokens` and `packages/ui-assets` hold reusable presentation boundaries.
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

## Runtime Boundary

The services package supports mock data for local frontend review and API-backed data when an endpoint is explicitly configured. Runtime selection is server-only:

- mock mode uses deterministic synthetic scenario fixtures;
- backend mode requires a configured API URL;
- production-like mock mode requires an explicit mock override.

Browser-visible source must not embed private backend origins. The current app shell still renders placeholder routes and does not call the services package from page code.
