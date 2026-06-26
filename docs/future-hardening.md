# Future Hardening

The current workbench implementation includes the app shell, mock service fixtures, backend-mode service boundary, Radix-backed adapter system and mock-mode reviewer evidence. Future work should stay focused on evidence gaps and production-next controls.

- Investigate the non-blocking Radix hidden-input hydration warning seen in visual-test logs before broadening form-control usage.
- Add focused tests only when planner decision, recommendation filtering, API error or backend-mode behaviour changes.
- Keep synthetic fixtures small and traceable to API contracts; use simulator `--repeat` only for deliberate volume checks.
- Expand visual review only around states that are hard to cover through normal planner routes.
- Keep theme packages focused on reusable styling primitives, token mapping and component Sass, not runtime service configuration.
- Keep backend API origins runtime-configured and server-only; do not introduce browser-visible backend URL variables.
- Add manual assistive-technology review when a handover requires human screen-reader, speech-input or platform accessibility evidence beyond the automated browser checks.
- Add deployed smoke coverage only when a temporary review host exists and its access boundary is intentionally configured.
- Add SBOM generation, image provenance, signing and registry scanning policy before promoting container images beyond local review.
