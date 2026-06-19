import type {
  CreatePlanningRunRequest,
  MigrationReadinessReport,
  OperationsPostureReport,
  PackageDecisionResult,
  PlanningRecommendationsResult,
  PlanningRunResult,
  RecordPackageDecisionRequest
} from "../contracts";
import { ServiceConfigurationError } from "../errors";
import {
  mapOperationsPosture,
  mapPlannerDecisionResult,
  mapPlanningRecommendations,
  mapScenarioOutcome,
  mapScenarioOutcomeSummary,
  mapSourceDataReadiness,
  mapWorkOrderBacklog
} from "../mappers";
import type {
  PlannerDecisionCommand,
  PlannerServices,
  RecommendationQuery
} from "../models";
import type { BackendRuntimeConfig } from "../runtime-config";
import { BackendHttpClient, type FetchLike } from "./http-client";

export function createBackendPlannerServices(
  config: BackendRuntimeConfig,
  fetchImpl?: FetchLike
): PlannerServices {
  const client = new BackendHttpClient(config.apiBaseUrl, fetchImpl);

  return {
    getRuntimeInfo: () => ({
      mode: "backend",
      backendConfigured: true
    }),

    getOperationsPosture: async () => {
      const posture = await client.getJson<OperationsPostureReport>("api/v1/operations/posture");
      return mapOperationsPosture(posture);
    },

    getSourceDataReadiness: async () => {
      const posture = await client.getJson<OperationsPostureReport>("api/v1/operations/posture");
      const migration = await client.getJson<MigrationReadinessReport>(
        "api/v1/operations/migration-readiness",
        [200, 503]
      );

      return mapSourceDataReadiness(migration, mapOperationsPosture(posture));
    },

    getScenarioOutcomeSummary: async () => {
      const posture = await client.getJson<OperationsPostureReport>("api/v1/operations/posture");
      const recommendations = await getBackendRecommendationResult(
        client,
        undefined,
        config.defaultRecommendationQuery
      );
      const outcome = mapScenarioOutcome({
        scenarioId: "backend-current",
        label: "Current backend review state",
        operationsPosture: posture,
        recommendations
      });

      return mapScenarioOutcomeSummary([outcome], outcome.scenarioId, posture.checkedAtUtc);
    },

    getRecommendationSet: async (query) => {
      return getBackendRecommendationSet(client, query, config.defaultRecommendationQuery);
    },

    getWorkOrderBacklog: async (query) => {
      const recommendations = await getBackendRecommendationSet(
        client,
        query,
        config.defaultRecommendationQuery
      );
      return mapWorkOrderBacklog(recommendations, new Date().toISOString());
    },

    recordPlannerDecision: async (command) => {
      const request: RecordPackageDecisionRequest = {
        decision: command.decision,
        reasonCode: command.reasonCode,
        notes: command.notes,
        decidedBy: command.decidedBy,
        workOrderIds: command.workOrderIds ?? []
      };

      const result = await client.postJson<RecordPackageDecisionRequest, PackageDecisionResult>(
        `api/v1/packages/${command.packageId}/decisions`,
        request
      );

      return mapPlannerDecisionResult(result);
    }
  };
}

async function getBackendRecommendationSet(
  client: BackendHttpClient,
  query: RecommendationQuery | undefined,
  defaultQuery: RecommendationQuery | undefined
) {
  return mapPlanningRecommendations(await getBackendRecommendationResult(client, query, defaultQuery));
}

async function getBackendRecommendationResult(
  client: BackendHttpClient,
  query: RecommendationQuery | undefined,
  defaultQuery: RecommendationQuery | undefined
) {
  const effectiveQuery = mergeRecommendationQuery(defaultQuery, query);
  const planningRunId = await resolvePlanningRunId(client, effectiveQuery);
  return client.getJson<PlanningRecommendationsResult>(
    `api/v1/planning-runs/${planningRunId}/recommendations`
  );
}

function mergeRecommendationQuery(
  defaultQuery: RecommendationQuery | undefined,
  query: RecommendationQuery | undefined
): RecommendationQuery | undefined {
  if (!defaultQuery) return query;
  if (!query) return defaultQuery;

  return {
    ...defaultQuery,
    ...query
  };
}

async function resolvePlanningRunId(
  client: BackendHttpClient,
  query: RecommendationQuery | undefined
) {
  if (query?.planningRunId) {
    return query.planningRunId;
  }

  if (query?.createRunIfMissing === false) {
    throw new ServiceConfigurationError(
      "planning-run-id-required",
      "A planning run id is required when automatic run creation is disabled."
    );
  }

  const request: CreatePlanningRunRequest = {
    horizon: query?.horizon ?? "two-week",
    horizonStartUtc: query?.horizonStartUtc,
    horizonEndUtc: query?.horizonEndUtc,
    requestedBy: query?.requestedBy ?? "planner-workbench"
  };

  const createdRun = await client.postJson<CreatePlanningRunRequest, PlanningRunResult>(
    "api/v1/planning-runs",
    request,
    [202]
  );

  return createdRun.id;
}
