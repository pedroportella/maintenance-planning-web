import {
  mapOperationsPosture,
  mapPlannerDecisionResult,
  mapPlanningRecommendations,
  mapScenarioOutcome,
  mapScenarioOutcomeSummary,
  mapSourceDataReadiness,
  mapWorkOrderBacklog
} from "../mappers";
import type { PlannerDecisionCommand, PlannerServices } from "../models";
import type { MockRuntimeConfig } from "../runtime-config";
import {
  getMockScenarioFixture,
  mockPackageDecisionResult,
  mockScenarioIds,
  stableFixtureTimestamp
} from "../testing/fixtures";
import type {
  PackageRecommendationResult,
  PlannerDecisionResult,
  PlanningRecommendationsResult
} from "../contracts";

export function createMockPlannerServices(config: MockRuntimeConfig): PlannerServices {
  const fixture = getMockScenarioFixture(config.mockScenarioId);

  return {
    getRuntimeInfo: () => ({
      mode: "mock",
      backendConfigured: false,
      mockScenarioId: config.mockScenarioId
    }),

    getOperationsPosture: async () => mapOperationsPosture(fixture.operationsPosture),

    getSourceDataReadiness: async () =>
      mapSourceDataReadiness(
        fixture.migrationReadiness,
        mapOperationsPosture(fixture.operationsPosture)
      ),

    getScenarioOutcomeSummary: async () => {
      const outcomes = mockScenarioIds.map((scenarioId) => {
        const scenarioFixture = getMockScenarioFixture(scenarioId);

        return mapScenarioOutcome({
          scenarioId,
          operationsPosture: scenarioFixture.operationsPosture,
          recommendations: withRecordedDecisions(
            scenarioFixture.recommendations,
            scenarioId
          )
        });
      });

      return mapScenarioOutcomeSummary(outcomes, config.mockScenarioId, stableFixtureTimestamp);
    },

    getRecommendationSet: async () =>
      mapPlanningRecommendations(withRecordedDecisions(fixture.recommendations, config.mockScenarioId)),

    getWorkOrderBacklog: async () =>
      mapWorkOrderBacklog(
        mapPlanningRecommendations(withRecordedDecisions(fixture.recommendations, config.mockScenarioId)),
        stableFixtureTimestamp
      ),

    recordPlannerDecision: async (command) => {
      const recommendation = fixture.recommendations.recommendations.find(
        (candidate) => candidate.packageId === command.packageId
      );
      const result = mockPackageDecisionResult({
        ...commandToFixtureInput(command),
        packageNumber: recommendation?.packageNumber
      });

      recordMockDecisions(config.mockScenarioId, command.packageId, result.decisions);

      return mapPlannerDecisionResult(result);
    }
  };
}

function commandToFixtureInput(command: PlannerDecisionCommand) {
  return {
    packageId: command.packageId,
    decision: command.decision,
    reasonCode: command.reasonCode,
    notes: command.notes,
    decidedBy: command.decidedBy,
    workOrderIds: command.workOrderIds ?? []
  };
}

const recordedDecisionStore = new Map<string, readonly PlannerDecisionResult[]>();

function withRecordedDecisions(
  recommendations: PlanningRecommendationsResult,
  scenarioId: string
): PlanningRecommendationsResult {
  return {
    ...recommendations,
    recommendations: recommendations.recommendations.map((recommendation) =>
      withRecordedPackageDecisions(recommendation, scenarioId)
    )
  };
}

function withRecordedPackageDecisions(
  recommendation: PackageRecommendationResult,
  scenarioId: string
): PackageRecommendationResult {
  const recordedDecisions = recordedDecisionStore.get(decisionStoreKey(scenarioId, recommendation.packageId));

  if (!recordedDecisions || recordedDecisions.length === 0) {
    return recommendation;
  }

  const latestDecision = recordedDecisions.at(-1);

  return {
    ...recommendation,
    status: latestDecision ? packageStatusForDecision(latestDecision.decision) : recommendation.status,
    decisions: [...recommendation.decisions, ...recordedDecisions]
  };
}

function recordMockDecisions(
  scenarioId: string,
  packageId: string,
  decisions: readonly PlannerDecisionResult[]
) {
  const key = decisionStoreKey(scenarioId, packageId);
  const existingDecisions = recordedDecisionStore.get(key) ?? [];

  recordedDecisionStore.set(key, [...existingDecisions, ...decisions]);
}

function decisionStoreKey(scenarioId: string, packageId: string) {
  return `${scenarioId}:${packageId}`;
}

function packageStatusForDecision(decision: string) {
  if (decision === "Accepted") return "PlannerReviewed";
  if (decision === "Rejected") return "Rejected";
  if (decision === "Deferred") return "Deferred";

  return "Recommended";
}
