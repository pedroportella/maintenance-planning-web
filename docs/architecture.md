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

The first screen is a static synthetic coordination queue that proves the workbench shell, metrics, table layout and route navigation without introducing a home-screen service call. The backlog, coordination exception, planning-run, recommendation, operations posture and scenario outcome routes read from the server-side services package. Operations and scenario pages expose compact freshness, import, posture and scenario evidence for reviewer flow without adding a broad admin dashboard.

The `/ui-library` route is separate from planner task navigation. It is a no-index reviewer/developer evidence page for reusable UI states and uses deterministic mock services only.

## Visual System

The app imports the shared theme from `@maintenance-planning/ui-library/theme.css`. That stylesheet imports token custom properties from `@maintenance-planning/ui-tokens/theme.css`, then defines base element, app shell, navigation, page header, status, metrics, table, alert and empty/loading/error state styling.

App-local CSS remains responsible for route-specific composition. Brand text, generic icon names and provenance notes live in `packages/ui-assets`, keeping visual metadata out of route files.

Focused Playwright visual baselines cover `/ui-library` across desktop and mobile viewports. They complement route-level smoke tests and do not replace service-boundary tests.

## Runtime Boundary

The services package supports mock data for local frontend review and API-backed data when an endpoint is explicitly configured. Runtime selection is server-only:

- mock mode uses deterministic synthetic scenario fixtures;
- backend mode requires a configured API URL;
- production-like mock mode requires an explicit mock override.

Browser-visible source must not embed private backend origins. Service calls are made from server-side route code and server actions; the browser receives mapped planner-facing view state and form results, not backend configuration.

Review hosting should keep that boundary intact by running the workbench as a server-rendered Next.js app. The post-build browser-bundle leakage guard scans generated assets after `pnpm build` to catch accidental backend-origin exposure before a review build is shared.

## Container Runtime

The repo builds a Node.js 22 Next.js standalone image from the workspace root. The image runs on port `8080`, exposes `/health/live` for liveness checks and copies only the standalone server output, static assets and public assets into the final runtime layer.

Local container smoke starts the image in explicit mock mode and checks the first screen, recommendations, operations posture and UI-library routes. Backend review mode remains server-only through `MAINTENANCE_PLANNING_API_URL`; the browser must not receive a `NEXT_PUBLIC_*` backend origin.
