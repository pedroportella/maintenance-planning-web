# Guardrails

The repo includes guard scripts before feature screens are added.

## Public Docs

Public docs are checked for private planning references, employer or client branding, vendor-specific source-system wording, local environment file references and unsupported operational claims.

## Artefacts

The artefact guard blocks committed local environment files, generated build output, coverage output, test reports, local cloud config and log files.

## Secrets And Origins

The secret guard scans candidate files for credentials and sensitive connection strings. The browser-origin guard scans app and package source for hard-coded private backend origins.

## Reviewer Evidence

Reviewer evidence checks required repo files, workspace boundaries, root scripts, local Markdown links and the presence of the UI-library showcase smoke.

## Visual Foundation

Token tests cover required theme variables and contrast-sensitive foreground/background pairs. Asset tests cover neutral wordmark metadata, icon-map coverage and local provenance notes. Theme tests confirm that the UI-library stylesheet imports token custom properties before shared component styles.

The `/ui-library` route is an internal reviewer/developer evidence page. `pnpm test:visual:showcase` verifies the route across desktop and mobile viewports and checks accessible names plus tone contrast for reusable states.
