import { describe, expect, it } from "vitest";
import {
  API_TOKEN_ENV,
  API_URL_ENV,
  BACKEND_HORIZON_END_ENV,
  BACKEND_HORIZON_START_ENV,
  BACKEND_REQUESTED_BY_ENV,
  DATA_MODE_ENV,
  createPlannerServices,
  mockScenarioIds,
  type CreatePlanningRunRequest,
  type FetchLike,
  type OperationsPostureReport,
  type PackageDecisionResult,
  type PlanningRecommendationsResult,
  type PlanningRunResult
} from "../src";
import { mapOperationsPosture } from "../src/mappers";

describe("planner services", () => {
  it("maps operations posture DTOs into planner-facing posture states", () => {
    expect(
      mapOperationsPosture({
        databaseConfigured: true,
        status: "ready",
        latestImport: {
          importId: "40000000-0000-4000-8000-000000009001",
          sourceSystem: "synthetic-source",
          importKind: "maintenance-events",
          status: "completed",
          receivedCount: 4,
          acceptedCount: 4,
          rejectedCount: 0,
          ignoredDuplicateCount: 0,
          ignoredStaleCount: 0,
          receivedAtUtc: "2026-01-15T08:00:00.000Z",
          completedAtUtc: "2026-01-15T08:01:00.000Z"
        },
        checkedAtUtc: "2026-01-15T08:01:00.000Z"
      })
    ).toMatchObject({
      freshness: "fresh",
      state: "healthy"
    });

    expect(
      mapOperationsPosture({
        databaseConfigured: true,
        status: "ready",
        latestImport: {
          importId: "40000000-0000-4000-8000-000000009002",
          sourceSystem: "synthetic-source",
          importKind: "maintenance-events",
          status: "completed",
          receivedCount: 4,
          acceptedCount: 3,
          rejectedCount: 0,
          ignoredDuplicateCount: 0,
          ignoredStaleCount: 1,
          receivedAtUtc: "2026-01-15T08:00:00.000Z",
          completedAtUtc: "2026-01-15T08:01:00.000Z"
        },
        checkedAtUtc: "2026-01-15T08:01:00.000Z"
      })
    ).toMatchObject({
      freshness: "stale",
      state: "stale"
    });

    expect(
      mapOperationsPosture({
        databaseConfigured: true,
        status: "ready",
        latestImport: {
          importId: "40000000-0000-4000-8000-000000009003",
          sourceSystem: "synthetic-source",
          importKind: "maintenance-events",
          status: "completed",
          receivedCount: 4,
          acceptedCount: 3,
          rejectedCount: 1,
          ignoredDuplicateCount: 0,
          ignoredStaleCount: 0,
          receivedAtUtc: "2026-01-15T08:00:00.000Z",
          completedAtUtc: "2026-01-15T08:01:00.000Z"
        },
        checkedAtUtc: "2026-01-15T08:01:00.000Z"
      })
    ).toMatchObject({
      state: "degraded"
    });
  });

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

  it("summarizes mock scenario outcomes with healthy stale and degraded states", async () => {
    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "mock",
        MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO: "baseline-week"
      }
    });

    const summary = await services.getScenarioOutcomeSummary();

    expect(summary.latest).toMatchObject({
      scenarioId: "baseline-week",
      status: "healthy"
    });
    expect(summary.outcomes.map((outcome) => outcome.status).sort()).toEqual([
      "degraded",
      "healthy",
      "stale"
    ]);
  });

  it("records mock planner decisions and reflects them in recommendations and backlog", async () => {
    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "mock",
        MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO: "baseline-week"
      }
    });
    const recommendationSet = await services.getRecommendationSet();
    const recommendation = recommendationSet.recommendations[0];

    if (!recommendation) {
      throw new Error("Expected a baseline recommendation fixture.");
    }

    const result = await services.recordPlannerDecision({
      decision: "Accepted",
      packageId: recommendation.packageId,
      reasonCode: "planner-accepted",
      workOrderIds: recommendation.workOrders.map((workOrder) => workOrder.id)
    });
    const updatedRecommendationSet = await services.getRecommendationSet();
    const updatedRecommendation = updatedRecommendationSet.recommendations.find(
      (candidate) => candidate.packageId === recommendation.packageId
    );
    const backlog = await services.getWorkOrderBacklog();
    const decidedBacklogItem = backlog.items.find(
      (item) => item.packageId === recommendation.packageId
    );

    expect(result).toMatchObject({
      packageNumber: recommendation.packageNumber,
      packageStatus: "PlannerReviewed"
    });
    expect(updatedRecommendation?.decisions.at(-1)).toMatchObject({
      decision: "Accepted",
      reasonCode: "planner-accepted"
    });
    expect(decidedBacklogItem?.latestDecision).toMatchObject({
      decision: "Accepted",
      reasonCode: "planner-accepted"
    });
  });

  it("uses the same service facade in backend mode", async () => {
    const fetchCalls: string[] = [];
    const fetchImpl: FetchLike = async (input, init) => {
      fetchCalls.push(`${init?.method ?? "GET"} ${input}`);
      expect(new Headers(init?.headers).get("authorization")).toBe(
        "Bearer local-reviewer-token"
      );

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

      if (input.endsWith("/api/v1/packages/60000000-0000-4000-8000-000000009001/decisions")) {
        expect(JSON.parse(String(init?.body))).toMatchObject({
          decision: "Deferred",
          reasonCode: "missing-parts",
          workOrderIds: ["30000000-0000-4000-8000-000000009001"]
        });

        return jsonResponse<PackageDecisionResult>({
          packageId: "60000000-0000-4000-8000-000000009001",
          packageNumber: "PKG-BACKEND-001",
          packageStatus: "Deferred",
          decisions: [
            {
              id: "80000000-0000-4000-8000-000000009001",
              packageId: "60000000-0000-4000-8000-000000009001",
              workOrderId: "30000000-0000-4000-8000-000000009001",
              decision: "Deferred",
              reasonCode: "missing-parts",
              notes: null,
              decidedAtUtc: "2026-01-15T08:02:00.000Z",
              decidedBy: "planner-workbench"
            }
          ]
        });
      }

      return jsonResponse({ error: "unexpected request" }, 404);
    };

    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test",
        [API_TOKEN_ENV]: "local-reviewer-token"
      },
      fetchImpl
    });

    await expect(services.getOperationsPosture()).resolves.toMatchObject({
      databaseConfigured: true,
      state: "attention",
      status: "ready"
    });
    await expect(services.getRecommendationSet()).resolves.toMatchObject({
      planningRunId: "50000000-0000-4000-8000-000000009001"
    });
    await expect(
      services.recordPlannerDecision({
        decision: "Deferred",
        packageId: "60000000-0000-4000-8000-000000009001",
        reasonCode: "missing-parts",
        workOrderIds: ["30000000-0000-4000-8000-000000009001"]
      })
    ).resolves.toMatchObject({
      packageNumber: "PKG-BACKEND-001",
      packageStatus: "Deferred"
    });

    expect(fetchCalls).toEqual([
      "GET https://api.example.test/api/v1/operations/posture",
      "POST https://api.example.test/api/v1/planning-runs",
      "GET https://api.example.test/api/v1/planning-runs/50000000-0000-4000-8000-000000009001/recommendations",
      "POST https://api.example.test/api/v1/packages/60000000-0000-4000-8000-000000009001/decisions"
    ]);
  });

  it("passes backend smoke horizon defaults into automatic planning-run creation", async () => {
    let createdRunRequest: CreatePlanningRunRequest | undefined;
    const fetchImpl: FetchLike = async (input, init) => {
      if (input.endsWith("/api/v1/planning-runs")) {
        createdRunRequest = JSON.parse(String(init?.body)) as CreatePlanningRunRequest;

        return jsonResponse<PlanningRunResult>(
          {
            id: "50000000-0000-4000-8000-000000009051",
            runNumber: "RUN-BACKEND-HORIZON",
            status: "Completed",
            horizon: "two-week",
            horizonStartUtc: "2026-01-16T00:00:00.000Z",
            horizonEndUtc: "2026-01-30T00:00:00.000Z",
            startedAtUtc: "2026-01-15T08:00:00.000Z",
            completedAtUtc: "2026-01-15T08:01:00.000Z",
            requestedBy: "planner-workbench-e2e",
            recommendationCount: 0,
            readyRecommendationCount: 0,
            blockedRecommendationCount: 0
          },
          202
        );
      }

      if (input.endsWith("/api/v1/planning-runs/50000000-0000-4000-8000-000000009051/recommendations")) {
        return jsonResponse<PlanningRecommendationsResult>({
          planningRunId: "50000000-0000-4000-8000-000000009051",
          runNumber: "RUN-BACKEND-HORIZON",
          status: "Completed",
          recommendations: []
        });
      }

      return jsonResponse({ error: "unexpected request" }, 404);
    };

    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test",
        [BACKEND_HORIZON_START_ENV]: "2026-01-16T00:00:00Z",
        [BACKEND_HORIZON_END_ENV]: "2026-01-30T00:00:00Z",
        [BACKEND_REQUESTED_BY_ENV]: "planner-workbench-e2e"
      },
      fetchImpl
    });

    await expect(services.getRecommendationSet()).resolves.toMatchObject({
      planningRunId: "50000000-0000-4000-8000-000000009051"
    });
    expect(createdRunRequest).toMatchObject({
      horizon: "two-week",
      horizonStartUtc: "2026-01-16T00:00:00Z",
      horizonEndUtc: "2026-01-30T00:00:00Z",
      requestedBy: "planner-workbench-e2e",
      idempotencyKey: expect.stringMatching(/^planner-workbench:two-week:[0-9a-f]{16}$/)
    });
  });

  it("uses a stable backend planning-run idempotency key for repeated automatic creation", async () => {
    const createdRunRequests: CreatePlanningRunRequest[] = [];
    const fetchImpl: FetchLike = async (input, init) => {
      if (input.endsWith("/api/v1/planning-runs")) {
        createdRunRequests.push(JSON.parse(String(init?.body)) as CreatePlanningRunRequest);

        return jsonResponse<PlanningRunResult>(
          {
            id: "50000000-0000-4000-8000-000000009061",
            runNumber: "RUN-BACKEND-IDEMPOTENT",
            status: "Completed",
            horizon: "two-week",
            horizonStartUtc: "2026-01-16T00:00:00.000Z",
            horizonEndUtc: "2026-01-30T00:00:00.000Z",
            startedAtUtc: "2026-01-15T08:00:00.000Z",
            completedAtUtc: "2026-01-15T08:01:00.000Z",
            requestedBy: "planner-workbench-e2e",
            recommendationCount: 0,
            readyRecommendationCount: 0,
            blockedRecommendationCount: 0
          },
          202
        );
      }

      if (input.endsWith("/api/v1/planning-runs/50000000-0000-4000-8000-000000009061/recommendations")) {
        return jsonResponse<PlanningRecommendationsResult>({
          planningRunId: "50000000-0000-4000-8000-000000009061",
          runNumber: "RUN-BACKEND-IDEMPOTENT",
          status: "Completed",
          recommendations: []
        });
      }

      return jsonResponse({ error: "unexpected request" }, 404);
    };

    const services = createPlannerServices({
      env: {
        [DATA_MODE_ENV]: "backend",
        [API_URL_ENV]: "https://api.example.test",
        [BACKEND_HORIZON_START_ENV]: "2026-01-16T00:00:00Z",
        [BACKEND_HORIZON_END_ENV]: "2026-01-30T00:00:00Z",
        [BACKEND_REQUESTED_BY_ENV]: "planner-workbench-e2e"
      },
      fetchImpl
    });

    await services.getRecommendationSet();
    await services.getRecommendationSet();

    expect(createdRunRequests).toHaveLength(2);
    expect(createdRunRequests[0]?.idempotencyKey).toBe(createdRunRequests[1]?.idempotencyKey);
  });

  it("derives backend scenario outcomes from posture and recommendation contracts", async () => {
    const fetchCalls: string[] = [];
    const fetchImpl: FetchLike = async (input, init) => {
      fetchCalls.push(`${init?.method ?? "GET"} ${input}`);

      if (input.endsWith("/api/v1/operations/posture")) {
        return jsonResponse<OperationsPostureReport>({
          databaseConfigured: true,
          status: "ready",
          latestImport: {
            importId: "40000000-0000-4000-8000-000000009101",
            sourceSystem: "synthetic-source",
            importKind: "maintenance-events",
            status: "completed",
            receivedCount: 4,
            acceptedCount: 3,
            rejectedCount: 0,
            ignoredDuplicateCount: 0,
            ignoredStaleCount: 1,
            receivedAtUtc: "2026-01-15T08:00:00.000Z",
            completedAtUtc: "2026-01-15T08:01:00.000Z"
          },
          checkedAtUtc: "2026-01-15T08:01:00.000Z"
        });
      }

      if (input.endsWith("/api/v1/planning-runs")) {
        return jsonResponse<PlanningRunResult>(
          {
            id: "50000000-0000-4000-8000-000000009101",
            runNumber: "RUN-BACKEND-POSTURE",
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

      if (input.endsWith("/api/v1/planning-runs/50000000-0000-4000-8000-000000009101/recommendations")) {
        return jsonResponse<PlanningRecommendationsResult>({
          planningRunId: "50000000-0000-4000-8000-000000009101",
          runNumber: "RUN-BACKEND-POSTURE",
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

    await expect(services.getScenarioOutcomeSummary()).resolves.toMatchObject({
      latest: {
        label: "Current backend review state",
        status: "stale"
      }
    });
    expect(fetchCalls).toEqual([
      "GET https://api.example.test/api/v1/operations/posture",
      "POST https://api.example.test/api/v1/planning-runs",
      "GET https://api.example.test/api/v1/planning-runs/50000000-0000-4000-8000-000000009101/recommendations"
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
