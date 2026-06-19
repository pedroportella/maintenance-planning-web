# Maintenance Planning Web Agent Guide

Durable repo guidance for the maintenance-planning web prototype.

## Where Context Belongs

- Keep stable engineering rules here.
- Keep private research, stage notes and caveats in the parent workspace notes.
- Keep public README and docs short, neutral and review-friendly.
- Do not copy private planning history into public docs, UI copy or commit subjects.

## Project Boundary

- This is a neutral planner workbench for synthetic maintenance-planning review flows.
- Use synthetic data only.
- Do not use employer or client branding, industry-specific wording, real customer data, live source-system access claims or operational service promises.
- Keep the API backend-authoritative for recommendation, decision and operations-posture state.
- Do not turn the workbench into a broad dashboard or field-worker application.

## Web Rules

- Prefer a focused planner workflow over marketing pages.
- Keep copy short, operational and role-specific.
- Use mock services for local frontend evidence until API-backed screens are explicitly added.
- Keep runtime API origins configurable; never hard-code workstation-only or private-network origins into browser-visible source.
- Add feature tests when screens begin to encode planner decisions or API response contracts.

## Package Boundaries

- `apps/planner-workbench` owns the Next.js application.
- `packages/services` owns API clients, mock adapters and response mappers.
- `packages/ui-assets` owns local web assets.
- `packages/ui-library` owns shared React components.
- `packages/ui-tokens` owns design token exports.
- `packages/utils` owns framework-neutral helpers.

## Tests And Checks

- Run guard scripts after public-doc, config or browser-source changes.
- Keep reviewer evidence independent of the API, simulator and cloud credentials.
- Expand `lint`, `typecheck`, `test` and `build` package scripts as implementation grows.

## Documentation

- README should answer what this repo is, where the workbench will live and what remains synthetic.
- Public docs are evidence notes, not implementation diaries.
- Keep examples source-system-shaped without naming vendor systems.
