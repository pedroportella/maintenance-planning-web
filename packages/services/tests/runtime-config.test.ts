import { describe, expect, it } from "vitest";
import {
  ALLOW_MOCKS_ENV,
  API_URL_ENV,
  BACKEND_HORIZON_END_ENV,
  BACKEND_HORIZON_START_ENV,
  BACKEND_REQUESTED_BY_ENV,
  DATA_MODE_ENV,
  MOCK_SCENARIO_ENV,
  ServiceConfigurationError,
  resolvePlannerRuntimeConfig
} from "../src";

describe("resolvePlannerRuntimeConfig", () => {
  it("defaults to the baseline mock scenario outside production-like builds", () => {
    expect(resolvePlannerRuntimeConfig({ NODE_ENV: "development" })).toEqual({
      mode: "mock",
      mockScenarioId: "baseline-week"
    });
  });

  it("selects backend mode only when a server-only API URL is provided", () => {
    expect(
      resolvePlannerRuntimeConfig({
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test/"
      })
    ).toEqual({
      mode: "backend",
      apiBaseUrl: "https://api.example.test"
    });
  });

  it("accepts optional backend planning horizon defaults for local smoke runs", () => {
    expect(
      resolvePlannerRuntimeConfig({
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test/",
        [BACKEND_HORIZON_START_ENV]: "2026-01-16T00:00:00Z",
        [BACKEND_HORIZON_END_ENV]: "2026-01-30T00:00:00Z",
        [BACKEND_REQUESTED_BY_ENV]: "planner-workbench-e2e"
      })
    ).toEqual({
      mode: "backend",
      apiBaseUrl: "https://api.example.test",
      defaultRecommendationQuery: {
        horizonStartUtc: "2026-01-16T00:00:00Z",
        horizonEndUtc: "2026-01-30T00:00:00Z",
        requestedBy: "planner-workbench-e2e"
      }
    });
  });

  it("requires backend planning horizon start and end together", () => {
    expect(() =>
      resolvePlannerRuntimeConfig({
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test/",
        [BACKEND_HORIZON_START_ENV]: "2026-01-16T00:00:00Z"
      })
    ).toThrow(/must be set together/);
  });

  it("rejects backend mode without an API URL", () => {
    expect(() => resolvePlannerRuntimeConfig({ [DATA_MODE_ENV]: "backend" })).toThrowError(
      ServiceConfigurationError
    );
  });

  it("requires explicit runtime mode for production-like builds", () => {
    expect(() => resolvePlannerRuntimeConfig({ NODE_ENV: "production" })).toThrow(
      /must be set to mock or backend/
    );
  });

  it("requires an explicit mock override for production-like mock mode", () => {
    expect(() =>
      resolvePlannerRuntimeConfig({
        NODE_ENV: "production",
        [DATA_MODE_ENV]: "mock"
      })
    ).toThrow(/required before mock data can be used/);

    expect(
      resolvePlannerRuntimeConfig({
        NODE_ENV: "production",
        [DATA_MODE_ENV]: "mock",
        [ALLOW_MOCKS_ENV]: "true",
        [MOCK_SCENARIO_ENV]: "parts-delay-replan"
      })
    ).toEqual({
      mode: "mock",
      mockScenarioId: "parts-delay-replan"
    });
  });

  it("keeps the backend URL out of public environment variable names", () => {
    expect(API_URL_ENV.startsWith("NEXT_PUBLIC_")).toBe(false);
  });
});
