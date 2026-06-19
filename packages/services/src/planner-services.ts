import { createBackendPlannerServices } from "./backend/backend-planner-services";
import { createMockPlannerServices } from "./mock/mock-planner-services";
import type { PlannerServices } from "./models";
import {
  resolvePlannerRuntimeConfig,
  type PlannerRuntimeConfig,
  type RuntimeEnvironment
} from "./runtime-config";
import type { FetchLike } from "./backend/http-client";

export type CreatePlannerServicesOptions = {
  readonly env?: RuntimeEnvironment;
  readonly config?: PlannerRuntimeConfig;
  readonly fetchImpl?: FetchLike;
};

export function createPlannerServices(options: CreatePlannerServicesOptions = {}): PlannerServices {
  const config = options.config ?? resolvePlannerRuntimeConfig(options.env);

  if (config.mode === "mock") {
    return createMockPlannerServices(config);
  }

  return createBackendPlannerServices(config, options.fetchImpl);
}
