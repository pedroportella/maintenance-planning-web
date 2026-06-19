# Architecture

The web repo is the planner-facing layer of the maintenance-planning showcase. It is intentionally API-driven: recommendation state, package decisions and operations posture belong to the API, while the workbench presents planner workflows over those contracts.

## Shape

- `apps/planner-workbench` will host the Next.js app.
- `packages/services` will hold API clients, mock adapters and response mappers.
- `packages/ui-library`, `packages/ui-tokens` and `packages/ui-assets` will hold reusable presentation boundaries.
- `packages/utils` will hold framework-neutral helpers.

## Runtime Boundary

The app should support mock data for local frontend review and API-backed data when an endpoint is explicitly configured. The repo guardrails do not depend on a running API, simulator or cloud account.

Browser-visible source must not embed private backend origins. Runtime configuration should be introduced through reviewed environment examples and service adapters when feature screens begin.
