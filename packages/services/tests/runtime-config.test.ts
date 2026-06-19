import { describe, expect, it } from "vitest";
import {
  ALLOW_MOCKS_ENV,
  API_URL_ENV,
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
