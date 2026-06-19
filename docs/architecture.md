# Architecture

The web repo is the planner-facing layer of the maintenance-planning showcase. It is intentionally API-driven: recommendation state, package decisions and operations posture belong to the API, while the workbench presents planner workflows over those contracts.

## Shape

- `apps/planner-workbench` hosts the Next.js App Router shell.
- `packages/services` will hold API clients, mock adapters and response mappers.
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

The app should support mock data for local frontend review and API-backed data when an endpoint is explicitly configured. The repo guardrails and current app shell do not depend on a running API, simulator or cloud account.

Browser-visible source must not embed private backend origins. Runtime configuration should be introduced through reviewed environment examples and service adapters when feature screens begin.
