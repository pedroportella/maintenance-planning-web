import {
  mapOperationsPosture,
  mapPlannerDecisionResult,
  mapPlanningRecommendations,
  mapSourceDataReadiness,
  mapWorkOrderBacklog
} from "../mappers";
import type { PlannerDecisionCommand, PlannerServices } from "../models";
import type { MockRuntimeConfig } from "../runtime-config";
import {
  getMockScenarioFixture,
  mockPackageDecisionResult,
  stableFixtureTimestamp
} from "../testing/fixtures";

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

    getRecommendationSet: async () => mapPlanningRecommendations(fixture.recommendations),

    getWorkOrderBacklog: async () =>
      mapWorkOrderBacklog(mapPlanningRecommendations(fixture.recommendations), stableFixtureTimestamp),

    recordPlannerDecision: async (command) =>
      mapPlannerDecisionResult(mockPackageDecisionResult(commandToFixtureInput(command)))
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
