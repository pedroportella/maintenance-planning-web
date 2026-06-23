# Reviewer Runbook

Use this runbook to inspect the planner workbench reviewer pack.

## Cross-Repo Fit

This workbench is the React planner surface in a three-repo synthetic showcase:

- [maintenance-planning-api](https://github.com/pedroportella/maintenance-planning-api) owns recommendation, decision, posture, replay and event contracts.
- [maintenance-data-simulator](https://github.com/pedroportella/maintenance-data-simulator) seeds deterministic synthetic scenarios locally or publishes them to EventBridge for a review stack.
- [maintenance-planning-web](https://github.com/pedroportella/maintenance-planning-web) shows the planner workflow through mock mode by default and server-side backend mode when the API has been seeded.

Use mock checks for default review evidence. Use backend smoke only after the sibling API is healthy and populated by the simulator. Keep backend origins and tokens server-only and out of browser-visible bundles.

## Prerequisites

- Node.js 22.
- pnpm through Corepack or an equivalent local install.

Docker is only needed for the optional container packaging smoke, not for the default local reviewer workflow.

## Fast Local Mock Workflow

Use this path for UI review and day-to-day iteration. It runs entirely against deterministic mock services.

```sh
pnpm install
pnpm guard
pnpm check
pnpm test:links
pnpm test:e2e:mock
pnpm test:reviewer-pack
pnpm test:visual:library
pnpm test:visual:showcase
pnpm test:reviewer-evidence
```

The local mock checks do not require Docker, the API, the simulator or cloud credentials.

The mock end-to-end smoke starts the workbench locally, verifies the planner shell, reviews coordination exceptions, operations posture and scenario outcomes, opens the recommendation workbench, records a mock planner decision, then checks planning-run detail and backlog state.

The library visual smoke starts the workbench in deterministic mock mode and verifies only the `/ui-library` screenshot baselines in desktop, tablet and mobile light/dark viewports. The showcase visual smoke verifies `/ui-library` plus routed workbench evidence in those same viewports. It checks accessible landmarks, route metadata, component family headings, table captions, live-region state names, tone contrast and focused screenshot baselines.

Generate a compact screenshot pack when review notes need current app images:

```sh
pnpm test:reviewer-pack
```

The command writes ignored PNG files to `test-results/reviewer-pack`. Run it last when preparing a review packet because later Playwright runs may clear `test-results`. Keep those files out of commits unless a later review explicitly asks for checked-in image evidence.

## Package Checks

Run package-scoped checks when a change touches a specific package boundary:

```sh
pnpm --filter @maintenance-planning/services check
pnpm --filter @maintenance-planning/ui-tokens check
pnpm --filter @maintenance-planning/ui-assets check
pnpm --filter @maintenance-planning/ui-library check
```

The services package check verifies runtime mode selection, deterministic synthetic fixtures, operations posture mapping, scenario outcome summaries, mock decision recording and backend adapter calls against typed contracts.

The visual package checks verify token exports, theme custom properties, contrast-sensitive pairs, neutral asset metadata, shared component markup and the shared theme stylesheet entrypoint.

## Handoff Checks

Run the focused build check when generated browser assets need leakage verification:

```sh
pnpm build
pnpm guard:browser-bundle
```

Run the full non-Docker gate before a broader handoff:

```sh
pnpm verify
```

The post-build browser-bundle leakage guard expects `pnpm build` to have produced `apps/planner-workbench/.next`. It scans generated browser assets for hard-coded private backend origins and is included in `pnpm verify`.

Refresh the showcase baselines only after intentionally reviewing the UI change:

```sh
pnpm test:visual:library:update
pnpm test:visual:library
pnpm test:visual:showcase:update
pnpm test:visual:showcase
```

The generated baseline files under `e2e/__visual-baselines__` are reviewer evidence. Do not commit screenshots from `test-results` or `playwright-report`.

## Optional Container Smoke

The container smoke starts the standalone runtime on a temporary local port with explicit mock-mode settings. It checks `/health/live`, core planner routes and the UI-library evidence page, then verifies that local-only files and private backend origins are not present in the final image.

```sh
pnpm container:build
pnpm container:smoke --skip-build
```

See [docs/reviewer-pack.md](reviewer-pack.md) for the five-minute review path, screenshot workflow and optional review-hosting boundary. See [docs/containerisation.md](containerisation.md) for image runtime notes.

## Optional Backend Smoke

Use this smoke when the sibling API and simulator repos are available locally. It is not part of the default guardrail path because it requires SQL Server, the API process and deterministic simulator data.

Start the local API with persistence enabled in `maintenance-planning-api`:

```sh
cp .env.local.example .env.local
docker compose --env-file .env.local --profile sqlserver up -d sqlserver
set -a
. ./.env.local
set +a
dotnet dotnet-ef database update --project src/MaintenancePlanning.Infrastructure/MaintenancePlanning.Infrastructure.csproj --startup-project src/MaintenancePlanning.Api/MaintenancePlanning.Api.csproj --context MaintenancePlanningDbContext
dotnet run --project src/MaintenancePlanning.Api/MaintenancePlanning.Api.csproj --urls http://127.0.0.1:5000
```

Seed deterministic synthetic data in `maintenance-data-simulator`:

```sh
cp .env.local.example .env.local
pnpm simulator feed --scenario baseline-week
```

Run the backend browser smoke in this repo:

```sh
cp .env.local.example .env.local
pnpm test:e2e:backend
```

The simulator and web smoke runners read `.env.local`; process environment variables still win. The backend smoke sets the baseline scenario horizon for the workbench server. Override `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC` and `MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC` only when seeding a different deterministic scenario.

Expected transcript markers:

- the simulator feed logs `feed-completed`;
- Playwright starts the workbench on a separate local port;
- the backend browser smoke reports one passing Chromium test for recommendations and operations posture.

If `MAINTENANCE_PLANNING_API_URL` is missing or malformed, `pnpm test:e2e:backend` exits before browser startup with a configuration message.
