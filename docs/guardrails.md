# Guardrails

The repo includes guard scripts for public docs, generated artefacts, secrets, browser-visible backend origins, package boundaries, reviewer evidence and visual baselines.

## Public Docs

Public docs are checked for private planning references, employer or client branding, vendor-specific source-system wording, local environment file references and unsupported operational claims.

## Artefacts

The artefact guard blocks committed local environment files, generated build output, coverage output, test reports, local cloud config and log files.

## Secrets And Origins

The secret guard scans candidate files for credentials and sensitive connection strings. The browser-origin guard scans app and package source for hard-coded private backend origins.

The browser-bundle leakage guard runs after `pnpm build` and scans generated app assets for hard-coded private backend origins. It is separate from the default source guard because it requires `apps/planner-workbench/.next`.

## Container Evidence

The container smoke builds or reuses the local image, starts the standalone Next.js runtime with restricted container flags, checks `/health/live` and key planner routes, and inspects the image for local-only files plus browser-visible private backend origins.

## Reviewer Evidence

Reviewer evidence checks required repo files, workspace boundaries, root scripts, local Markdown links, the reviewer-pack screenshot workflow, container scripts and the presence of focused UI-library and route-wide visual smokes.

## Visual Foundation

Token tests cover required theme variables and contrast-sensitive foreground/background pairs. Asset tests cover neutral wordmark metadata, icon-map coverage and local provenance notes. Theme tests confirm that the UI-library Sass entrypoint imports token custom properties before shared component styles and that the package does not publish a generated theme CSS artifact.

The `/ui-library` route is an internal reviewer/developer evidence page. `pnpm test:visual:library` verifies only the focused UI-library baselines, including theme-mode readability and constrained workflow controls. `pnpm test:visual:showcase` verifies the route plus routed workbench evidence across desktop, tablet and mobile light/dark viewports and checks accessible names, tone contrast, route metadata and page-width stability for reusable states.
