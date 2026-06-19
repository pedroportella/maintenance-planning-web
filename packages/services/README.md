# Services Package

Boundary for API clients, mock adapters and response mappers for the planner workbench.

## Runtime

Use `createPlannerServices()` from server-side code. It resolves either mock mode or backend mode from environment configuration:

- `MAINTENANCE_PLANNING_WEB_DATA_MODE=mock` uses deterministic synthetic fixtures.
- `MAINTENANCE_PLANNING_WEB_DATA_MODE=backend` requires `MAINTENANCE_PLANNING_API_URL`.
- `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC` and `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC` can set the automatic planning-run horizon for backend smoke runs.
- `MAINTENANCE_PLANNING_WEB_BACKEND_REQUESTED_BY` can set the synthetic requester label for backend smoke runs.
- `MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO` can select `baseline-week`, `event-window-conflict` or `parts-delay-replan`.
- `MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS=true` is required before mock mode can be used in a production-like build.

The API URL is intentionally not a public browser environment variable. The package should not hard-code workstation-only or private-network endpoints.

The repo-level `test:e2e:backend` command sets backend mode and baseline scenario horizon defaults for the workbench server, and requires `MAINTENANCE_PLANNING_API_URL`. If the API URL is missing or not an absolute HTTP(S) URL, the command exits before starting the browser.

Mock mode stores decisions in process for the local reviewer journey. It remains deterministic synthetic state and is not a persistence claim.

The service facade returns mapped view models for backlog, coordination exceptions, planning runs, recommendations, operations posture and scenario outcome summaries. Scenario outcomes are derived from synthetic fixtures in mock mode and from existing posture plus recommendation contracts in backend mode.

## Checks

```sh
pnpm --filter @maintenance-planning/services check
```
