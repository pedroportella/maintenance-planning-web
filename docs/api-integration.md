# API Integration

The planner workbench is shaped around the maintenance-planning API contract. The API remains authoritative for imports, planning runs, recommendations, decisions and operations posture.

## Expected Client Boundary

- Service clients live in `packages/services`.
- UI code should consume mapped view models rather than raw transport responses.
- Mock adapters should use small synthetic fixtures that mirror the API contract.
- Request correlation and safe error text should be preserved when API-backed screens are added.

## Local Review

Current guardrails run without the API. Future API-backed screens should keep local mock review available so contributors can verify layout and planner workflows without external credentials.
