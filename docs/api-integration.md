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

## Backend Mode Smoke

The backend end-to-end smoke keeps mock review fast while proving the workbench can read the local API contract after deterministic simulator data has been loaded.

Runtime inputs:

- `MAINTENANCE_PLANNING_WEB_DATA_MODE=backend` selects the backend adapter.
- `MAINTENANCE_PLANNING_API_URL` points the server-side adapter at the local API origin.
- `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC` and `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC` can align automatic planning-run creation with the deterministic simulator scenario.
- The API URL is not a public browser environment variable.

Copy the safe local example once, then use the repo-level command after the local API and simulator scenario are ready:

```sh
cp .env.local.example .env.local
pnpm test:e2e:backend
```

The backend smoke uses the baseline scenario horizon by default, opens recommendations, verifies the deterministic imported work order is visible, then opens operations posture and verifies planner-visible posture evidence from the same local API.
