# Reviewer Pack

This pack gives a compact review path for the synthetic planner workbench.

## Five-Minute Review

```sh
pnpm install
pnpm verify
pnpm test:e2e:mock
pnpm test:visual:showcase
pnpm container:smoke
```

Then inspect:

- the app shell and planner task flow at the local URL printed by Playwright;
- the UI evidence page at `/ui-library`;
- the focused baselines in `e2e/__visual-baselines__`;
- the reviewer runbook in [docs/reviewer-runbook.md](reviewer-runbook.md).

## Screenshot Capture

Use the screenshot workflow when a compact review packet needs current app images without committing generated files.

```sh
pnpm test:reviewer-pack
```

The command starts the planner workbench in deterministic mock mode and writes ignored PNG files to `test-results/reviewer-pack`. It captures the coordination queue, recommendations, operations posture, scenario outcomes and UI-library showcase. Run it last when preparing a review packet because later Playwright runs may clear `test-results`.

## Evidence Checks

The default review verification path includes:

- source guardrails for generated artefacts, public docs, secrets and browser-visible backend origins;
- workspace lint, type checks and package tests;
- a Next.js build;
- a post-build browser-bundle leakage guard;
- local standalone container build and smoke in CI;
- reviewer evidence smoke for required docs, scripts, configs and local Markdown links.

Run the post-build guard directly after `pnpm build` when checking deployment packaging:

```sh
pnpm guard:browser-bundle
```

## Optional Review Hosting

The workbench should be hosted as a server-rendered Next.js app for review. Static export is not the preferred path because backend mode and decision recording stay server-side.

Recommended review-hosting boundary:

- run Node.js 22 with the built Next.js app;
- keep `MAINTENANCE_PLANNING_API_URL` and any local API token as server-only environment variables;
- set `MAINTENANCE_PLANNING_WEB_DATA_MODE=mock` for deterministic standalone review, or `backend` only when a review API is intentionally available;
- do not expose backend origins or credentials through `NEXT_PUBLIC_*` variables;
- place review access behind hosting-provider access controls or a temporary private review URL.

Review hosting is demonstration infrastructure. It uses synthetic data, does not include an application auth layer, does not connect to live source systems and is not a readiness statement for customer traffic.

See [docs/containerisation.md](containerisation.md) for the local image commands, health route and AWS review-runtime notes.
