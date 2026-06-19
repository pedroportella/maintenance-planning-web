# Reviewer Runbook

Use this runbook to inspect the repo foundation.

## Prerequisites

- Node.js 22.
- pnpm through Corepack or an equivalent local install.

## Commands

```sh
pnpm install
pnpm guard
pnpm check
pnpm --filter @maintenance-planning/services check
pnpm --filter @maintenance-planning/ui-tokens check
pnpm --filter @maintenance-planning/ui-assets check
pnpm --filter @maintenance-planning/ui-library check
pnpm test:links
pnpm build
pnpm test:e2e:mock
pnpm test:reviewer-evidence
pnpm verify
```

The local checks do not require the API, simulator or cloud credentials.

The mock end-to-end smoke starts the workbench locally, verifies the planner shell, reviews coordination exceptions, operations posture and scenario outcomes, opens the recommendation workbench, records a mock planner decision, then checks planning-run detail and backlog state.

The services package check verifies runtime mode selection, deterministic synthetic fixtures, operations posture mapping, scenario outcome summaries, mock decision recording and backend adapter calls against typed contracts.

The visual package checks verify token exports, theme custom properties, contrast-sensitive pairs, neutral asset metadata, shared component markup and the shared theme stylesheet entrypoint.

## Optional Backend Smoke

Use this smoke when the sibling API and simulator repos are available locally. It is not part of the default guardrail path because it requires SQL Server, the API process and deterministic simulator data.

Start the local API with persistence enabled in `maintenance-planning-api`:

```sh
cp .env.local.example .env.local
docker compose --env-file .env.local --profile sqlserver up -d sqlserver
set -a
. ./.env.local
set +a
dotnet dotnet-ef database update --project src/MaintenancePlanning.Infrastructure/MaintenancePlanning.Infrastructure.csproj --startup-project src/MaintenancePlanning.Infrastructure/MaintenancePlanning.Infrastructure.csproj --context MaintenancePlanningDbContext
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
