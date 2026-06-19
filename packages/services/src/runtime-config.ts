import { ServiceConfigurationError } from "./errors";
import type { PlannerRuntimeMode, RecommendationQuery } from "./models";
import { isMockScenarioId, type MockScenarioId } from "./testing/fixtures";

export const DATA_MODE_ENV = "MAINTENANCE_PLANNING_WEB_DATA_MODE";
export const API_URL_ENV = "MAINTENANCE_PLANNING_API_URL";
export const ALLOW_MOCKS_ENV = "MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS";
export const MOCK_SCENARIO_ENV = "MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO";
export const BACKEND_HORIZON_START_ENV = "MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC";
export const BACKEND_HORIZON_END_ENV = "MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC";
export const BACKEND_REQUESTED_BY_ENV = "MAINTENANCE_PLANNING_WEB_BACKEND_REQUESTED_BY";

export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export type MockRuntimeConfig = {
  readonly mode: "mock";
  readonly mockScenarioId: MockScenarioId;
};

export type BackendRuntimeConfig = {
  readonly mode: "backend";
  readonly apiBaseUrl: string;
  readonly defaultRecommendationQuery?: RecommendationQuery;
};

export type PlannerRuntimeConfig = MockRuntimeConfig | BackendRuntimeConfig;

export function resolvePlannerRuntimeConfig(
  env: RuntimeEnvironment = process.env
): PlannerRuntimeConfig {
  assertServerRuntime();

  const modeValue = env[DATA_MODE_ENV]?.trim();
  const mode = parseMode(modeValue);
  const productionLike = isProductionLike(env);

  if (!mode && productionLike) {
    throw new ServiceConfigurationError(
      "runtime-mode-required",
      `${DATA_MODE_ENV} must be set to mock or backend for a production-like build.`
    );
  }

  if ((mode ?? "mock") === "mock") {
    if (productionLike && env[ALLOW_MOCKS_ENV] !== "true") {
      throw new ServiceConfigurationError(
        "mock-runtime-not-enabled",
        `${ALLOW_MOCKS_ENV}=true is required before mock data can be used in a production-like build.`
      );
    }

    const requestedScenario = env[MOCK_SCENARIO_ENV]?.trim() || "baseline-week";

    if (!isMockScenarioId(requestedScenario)) {
      throw new ServiceConfigurationError(
        "unknown-mock-scenario",
        `${MOCK_SCENARIO_ENV} must name a checked synthetic scenario fixture.`
      );
    }

    return {
      mode: "mock",
      mockScenarioId: requestedScenario
    };
  }

  const apiBaseUrl = env[API_URL_ENV]?.trim();

  if (!apiBaseUrl) {
    throw new ServiceConfigurationError(
      "backend-api-url-required",
      `${API_URL_ENV} must be set when backend mode is requested.`
    );
  }

  const defaultRecommendationQuery = resolveBackendRecommendationQuery(env);
  const backendConfig: BackendRuntimeConfig = {
    mode: "backend",
    apiBaseUrl: normalizeApiBaseUrl(apiBaseUrl)
  };

  return defaultRecommendationQuery
    ? {
        ...backendConfig,
        defaultRecommendationQuery
      }
    : backendConfig;
}

function parseMode(value: string | undefined): PlannerRuntimeMode | undefined {
  if (!value) return undefined;
  if (value === "mock" || value === "backend") return value;

  throw new ServiceConfigurationError(
    "invalid-runtime-mode",
    `${DATA_MODE_ENV} must be set to mock or backend.`
  );
}

function isProductionLike(env: RuntimeEnvironment) {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

function normalizeApiBaseUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ServiceConfigurationError(
      "invalid-backend-api-url",
      `${API_URL_ENV} must be an absolute HTTP or HTTPS URL.`
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ServiceConfigurationError(
      "invalid-backend-api-url",
      `${API_URL_ENV} must use HTTP or HTTPS.`
    );
  }

  return url.toString().replace(/\/$/, "");
}

function resolveBackendRecommendationQuery(env: RuntimeEnvironment): RecommendationQuery | undefined {
  const horizonStartUtc = env[BACKEND_HORIZON_START_ENV]?.trim();
  const horizonEndUtc = env[BACKEND_HORIZON_END_ENV]?.trim();
  const requestedBy = env[BACKEND_REQUESTED_BY_ENV]?.trim();

  if (!horizonStartUtc && !horizonEndUtc && !requestedBy) return undefined;

  if (!horizonStartUtc || !horizonEndUtc) {
    throw new ServiceConfigurationError(
      "backend-horizon-required",
      `${BACKEND_HORIZON_START_ENV} and ${BACKEND_HORIZON_END_ENV} must be set together.`
    );
  }

  assertIsoDateTime(BACKEND_HORIZON_START_ENV, horizonStartUtc);
  assertIsoDateTime(BACKEND_HORIZON_END_ENV, horizonEndUtc);

  return {
    horizonStartUtc,
    horizonEndUtc,
    requestedBy: requestedBy || "planner-workbench"
  };
}

function assertIsoDateTime(envName: string, value: string) {
  if (Number.isNaN(Date.parse(value))) {
    throw new ServiceConfigurationError(
      "invalid-backend-horizon",
      `${envName} must be an ISO date-time value.`
    );
  }
}

function assertServerRuntime() {
  if ("window" in globalThis) {
    throw new ServiceConfigurationError(
      "browser-runtime-not-supported",
      "Planner services must be created in a server runtime."
    );
  }
}
