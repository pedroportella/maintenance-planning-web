import { describe, expect, it } from "vitest";
import {
  API_URL_ENV,
  DATA_MODE_ENV,
  createPlannerServices,
  mockScenarioIds,
  type FetchLike,
  type OperationsPostureReport,
  type PlanningRecommendationsResult,
  type PlanningRunResult
} from "../src";

describe("planner services", () => {
  it("maps mock scenario fixtures into planner-facing backlog states", async () => {
    const states = new Set<string>();

    for (const scenarioId of mockScenarioIds) {
      const services = createPlannerServices({
        env: {
          [DATA_MODE_ENV]: "mock",
          MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO: scenarioId
        }
      });

      const backlog = await services.getWorkOrderBacklog();
      for (const item of backlog.items) {
        states.add(item.plannerState);
      }
    }

    expect([...states].sort()).toEqual(["blocked", "deferred", "ready"]);
  });

  it("uses the same service facade in backend mode", async () => {
    const fetchCalls: string[] = [];
    const fetchImpl: FetchLike = async (input, init) => {
      fetchCalls.push(`${init?.method ?? "GET"} ${input}`);

      if (input.endsWith("/api/v1/operations/posture")) {
        return jsonResponse<OperationsPostureReport>({
          databaseConfigured: true,
          status: "ready",
          latestImport: null,
          checkedAtUtc: "2026-01-15T08:00:00.000Z"
        });
      }

      if (input.endsWith("/api/v1/planning-runs")) {
        return jsonResponse<PlanningRunResult>(
          {
            id: "50000000-0000-4000-8000-000000009001",
            runNumber: "RUN-BACKEND-001",
            status: "Completed",
            horizon: "two-week",
            horizonStartUtc: "2026-01-15T00:00:00.000Z",
            horizonEndUtc: "2026-01-29T00:00:00.000Z",
            startedAtUtc: "2026-01-15T08:00:00.000Z",
            completedAtUtc: "2026-01-15T08:01:00.000Z",
            requestedBy: "planner-workbench",
            recommendationCount: 0,
            readyRecommendationCount: 0,
            blockedRecommendationCount: 0
          },
          202
        );
      }

      if (input.endsWith("/api/v1/planning-runs/50000000-0000-4000-8000-000000009001/recommendations")) {
        return jsonResponse<PlanningRecommendationsResult>({
          planningRunId: "50000000-0000-4000-8000-000000009001",
          runNumber: "RUN-BACKEND-001",
          status: "Completed",
          recommendations: []
        });
      }

      return jsonResponse({ error: "unexpected request" }, 404);
    };

    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test"
      },
      fetchImpl
    });

    await expect(services.getOperationsPosture()).resolves.toMatchObject({
      databaseConfigured: true,
      status: "ready"
    });
    await expect(services.getRecommendationSet()).resolves.toMatchObject({
      planningRunId: "50000000-0000-4000-8000-000000009001"
    });

    expect(fetchCalls).toEqual([
      "GET https://api.example.test/api/v1/operations/posture",
      "POST https://api.example.test/api/v1/planning-runs",
      "GET https://api.example.test/api/v1/planning-runs/50000000-0000-4000-8000-000000009001/recommendations"
    ]);
  });
});

function jsonResponse<TBody>(body: TBody, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}
