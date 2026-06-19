# Future Hardening

Future work should add the workbench implementation in small, reviewable slices.

- Add the Next.js app shell and mock service fixtures before API-backed workflows.
- Add focused tests when planner decisions, recommendation filtering or API error states become visible.
- Keep synthetic fixtures small and traceable to API contracts.
- Expand visual review only around states that are hard to cover through normal planner routes.
- Keep theme packages focused on reusable styling primitives, not runtime configuration or workflow logic.
- Keep browser API origins runtime-configured and documented through safe examples.
- Add deployed smoke coverage only when a temporary review host exists and its access boundary is intentionally configured.
- Add SBOM generation, image provenance, signing and registry scanning policy before promoting container images beyond local review.
