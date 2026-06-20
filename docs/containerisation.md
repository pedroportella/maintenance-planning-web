# Containerisation

The planner workbench is packaged as a server-rendered Next.js container for local review and AWS review infrastructure. The image runs the Next.js standalone server on port `8080` and keeps backend configuration on the server side.

## Local Commands

```sh
pnpm container:build
pnpm container:run
pnpm container:smoke
docker build -t maintenance-planning-web:local .
```

`pnpm container:run` starts the image in deterministic mock mode on `http://localhost:3104`. The smoke script builds the image unless `--skip-build` is passed, starts the container with restricted runtime flags, checks `/health/live`, `/`, `/recommendations`, `/operations-posture` and `/ui-library`, then inspects the image for local-only files and browser-visible private backend origins.

## Runtime Boundary

- The container uses `apps/planner-workbench/.next/standalone` output.
- `HOSTNAME=0.0.0.0` and `PORT=8080` are set in the runtime image.
- `/health/live` is a lightweight liveness route for container smoke and review load-balancer health checks.
- Mock review mode requires `MAINTENANCE_PLANNING_WEB_DATA_MODE=mock` and `MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS=true`.
- Backend review mode requires `MAINTENANCE_PLANNING_WEB_DATA_MODE=backend` and a server-only `MAINTENANCE_PLANNING_API_URL`.
- Protected local backend review routes can also use a server-only `MAINTENANCE_PLANNING_API_TOKEN`.
- Do not add a `NEXT_PUBLIC_*` backend URL or token. The browser should receive rendered UI and action results, not private service origins or credentials.

For the cross-repo local Docker recipe, including API, simulator and web commands, see the [local Docker system runbook](https://github.com/pedroportella/maintenance-planning-api/blob/main/docs/local-docker-system.md).

## AWS Review Notes

Use the image as a long-running ECS/Fargate web service in review infrastructure. The review task should receive runtime configuration through task environment variables or secret references, publish logs to the review log group and expose `/health/live` through the review load-balancer target group.

The web task should call the API from server-side service adapters. Prefer private service-to-service routing for that backend URL during infrastructure work. The image should be pushed to the review registry and referenced by digest in task definitions rather than by an implicit moving tag.

## Image Identity

The build script sets OCI labels for image title, source, revision and creation time. CI builds the local image and runs the same smoke script without cloud credentials.

## Supply Chain Gaps

Follow-up deployment work should add SBOM generation, provenance attestations, image signing, registry scanning policy and digest promotion evidence. Those controls are outside the current local container smoke.
