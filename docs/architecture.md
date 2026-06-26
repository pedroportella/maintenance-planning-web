# Architecture

The web repo is the planner-facing layer of the maintenance-planning showcase. It is intentionally API-driven: recommendation state, package decisions and operations posture belong to the API, while the workbench presents planner workflows over those contracts.

## Shape

- `apps/planner-workbench` hosts the Next.js App Router shell.
- `packages/services` holds API-facing contracts, mock adapters, backend adapters and response mappers.
- `packages/ui-tokens` holds typed visual primitives, CSS custom properties and Sass palette sources.
- `packages/ui-assets` holds neutral wordmark metadata, generic icon names and asset provenance notes.
- `packages/ui-library` holds Radix fidelity adapters, planner workflow components and the shared Sass theme entrypoint.
- `packages/utils` holds framework-neutral helpers such as planner route metadata.

## App Shell

The workbench currently renders local task routes for:

- work-order backlog;
- planning runs;
- recommendations;
- coordination exceptions;
- operations posture;
- scenario outcomes.

The first screen is a compact workbench start page that points reviewers into the service-backed recommendation, work-order triage and evidence routes without introducing a home-screen service call. The backlog, coordination exception, planning-run, recommendation, operations posture and scenario outcome routes read from the server-side services package. Operations and scenario pages expose compact freshness, import, posture and scenario evidence for reviewer flow without adding a broad admin dashboard.

The routed pages share the same planner shell and responsive page-width model.
The start page, decision flow and evidence routes should therefore read as one
workbench surface during desktop, tablet and mobile review, even when individual
routes have different data density.

The `/ui-library` route is separate from planner task navigation. It is a no-index reviewer/developer evidence page for reusable UI states and uses deterministic mock services only. Its review role is to make theme-mode readability, constrained workflow controls, status/alert states, table structure and route-rollout snapshots inspectable without needing live services.

## Visual System

The app imports the shared theme from `@maintenance-planning/ui-library/theme.scss`. That Sass entry imports Radix Themes CSS, maps token custom properties from `@maintenance-planning/ui-tokens`, then loads shared adapter and component-local styles for shell, navigation, page, status, metrics, table, alert, form, decision and empty/loading/error state styling.

Reusable route composition belongs to `packages/ui-library` adapters and component-local Sass. Component families live under `packages/ui-library/src/components`; theme code stays under `src/theme`; shared non-visual helpers stay under `src/utils`. The UI library publishes the Sass entrypoint and does not publish a generated `theme.css` artifact.

App-local CSS stays limited to route handoff concerns. Brand text, generic icon names and provenance notes live in `packages/ui-assets`, keeping visual metadata out of route files.

Focused Playwright visual baselines cover `/ui-library` plus routed workbench evidence across desktop, tablet and mobile light/dark viewports. They complement route-level smoke tests and do not replace service-boundary tests or manual assistive-technology review.

## Runtime Boundary

The services package supports mock data for local frontend review and API-backed data when an endpoint is explicitly configured. Runtime selection is server-only:

- mock mode uses deterministic synthetic scenario fixtures;
- backend mode requires a configured server-side API URL and can use a server-side API token for protected local routes;
- production-like mock mode requires an explicit mock override.

Browser-visible source must not embed private backend origins. Service calls are made from server-side route code and server actions; the browser receives mapped planner-facing view state and form results, not backend configuration.

Review hosting should keep that boundary intact by running the workbench as a server-rendered Next.js app. The post-build browser-bundle leakage guard scans generated assets after `pnpm build` to catch accidental backend-origin exposure before a review build is shared.

## Container Runtime

The repo builds a Node.js 22 Next.js standalone image from the workspace root. The image runs on port `8080`, exposes `/health/live` for liveness checks and copies only the standalone server output, static assets and public assets into the final runtime layer.

Local container smoke starts the image in explicit mock mode and checks the first screen, recommendations, operations posture and UI-library routes. Backend review mode remains server-only through `MAINTENANCE_PLANNING_API_URL` and optional token configuration; the browser must not receive a `NEXT_PUBLIC_*` backend origin or credential.
