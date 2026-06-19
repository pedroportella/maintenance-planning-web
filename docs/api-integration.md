# API Integration

The planner workbench is shaped around the maintenance-planning API contract. The API remains authoritative for imports, planning runs, recommendations, decisions and operations posture.

## Expected Client Boundary

- Service clients live in `packages/services`.
- UI code should consume mapped view models rather than raw transport responses.
- Mock adapters should use small synthetic fixtures that mirror the API contract.
- Request correlation and safe error text should be preserved when API-backed screens are added.
- Backend mode is server-only and requires an explicit API URL.
- Mock mode uses deterministic scenario fixtures for local review.

## Local Review

Current guardrails run without the API. The services package can resolve mock mode for local review or backend mode when an endpoint is explicitly configured. Feature screens should keep local mock review available so contributors can verify layout and planner workflows without external credentials.

The planner routes call `createPlannerServices()` from server-side app code:

- `/work-order-backlog` maps recommendation work orders into a planner inbox with ready, blocked and deferred states.
- `/coordination-exceptions` filters the service-backed backlog for blocked, deferred or source-data review items.
- `/planning-runs` lists the current service-supplied run and links to `/planning-runs/[runId]` for package detail.
- `/recommendations` reads package recommendations and records accept, reject or defer decisions through a server action.
- `/operations-posture` maps operations posture, source-data readiness and latest scenario evidence into planner-visible signals.
- `/scenario-outcomes` summarizes deterministic synthetic scenario outcomes and backend-mode review state derived from existing service contracts.

Mock mode keeps the decision journey deterministic and synthetic. Backend mode remains explicit and server-only.
