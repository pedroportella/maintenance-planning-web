import { describe, expect, it } from "vitest";
import {
  getPrimaryCoordinationSection,
  getWorkbenchSection,
  workbenchSections
} from "@maintenance-planning/utils";
import { PlannerServiceRequestError } from "@maintenance-planning/services";
import {
  normaliseDecisionNotes,
  resolvePlannerDecisionAction
} from "../lib/planner-decisions";
import { decisionHistoryItemKey } from "../lib/decision-history";
import {
  acceptDisabledReason,
  buildBacklogMetrics,
  buildOperationsMetrics,
  buildRecommendationMetrics,
  buildScenarioOutcomeMetrics,
  formatBacklogResultSummary,
  formatHours,
  formatStateLabel,
  formatUtc,
  recommendationStateBadgeSpecs,
  toneForDecision,
  toneForPostureState,
  toneForScenarioOutcome,
  workOrderStateBadgeSpecs
} from "../lib/planner-format";
import { toPlannerRouteIssue } from "../lib/planner-route-state";

describe("workbench section model", () => {
  it("defines the planner task routes in a stable order", () => {
    expect(workbenchSections.map((section) => section.path)).toEqual([
      "/recommendations",
      "/work-order-backlog",
      "/coordination-exceptions",
      "/operations-posture",
      "/scenario-outcomes",
      "/planning-runs"
    ]);
  });

  it("selects recommendations as the home focus", () => {
    expect(getPrimaryCoordinationSection().slug).toBe("recommendations");
  });

  it("returns route metadata by slug", () => {
    expect(getWorkbenchSection("recommendations").label).toBe("Recommendations");
    expect(getWorkbenchSection("recommendations").navGroup).toBe("Review");
    expect(getWorkbenchSection("recommendations").placeholderBody).toContain(
      "planner service boundary"
    );
  });

  it("groups navigation into review and evidence sections", () => {
    expect(workbenchSections.map((section) => section.navGroup)).toEqual([
      "Review",
      "Review",
      "Review",
      "Evidence",
      "Evidence",
      "Evidence"
    ]);
  });

  it("maps planner decision controls to API-shaped command values", () => {
    expect(resolvePlannerDecisionAction("accept")).toMatchObject({
      decision: "Accepted",
      reasonCode: "planner-accepted"
    });
    expect(resolvePlannerDecisionAction("defer:missing-parts")).toMatchObject({
      decision: "Deferred",
      reasonCode: "missing-parts"
    });
    expect(normaliseDecisionNotes("  review after parts check  ")).toBe(
      "review after parts check"
    );
  });

  it("keeps repeated decision ids unique for React decision-history rows", () => {
    const duplicateDecision = {
      decidedAtUtc: "2026-01-15T08:00:00.000Z",
      decidedBy: "planner-workbench",
      decision: "Accepted",
      id: "80000000-0000-4000-8000-000000009990",
      packageId: "60000000-0000-4000-8000-000000002000",
      reasonCode: "planner-accepted",
      workOrderId: "30000000-0000-4000-8000-000000002000"
    };
    const keys = [duplicateDecision, duplicateDecision].map(decisionHistoryItemKey);

    expect(new Set(keys).size).toBe(2);
    expect(keys[0]).toContain(duplicateDecision.id);
  });

  it("formats planner metrics and state labels", () => {
    expect(formatUtc("2026-01-15T10:30:00.000Z")).toBe("2026-01-15 10:30 UTC");
    expect(formatHours(null)).toBe("No estimate");
    expect(toneForDecision("Rejected")).toBe("critical");
    expect(toneForPostureState("degraded")).toBe("critical");
    expect(toneForScenarioOutcome("stale")).toBe("warning");
    expect(
      buildBacklogMetrics({
        generatedAtUtc: "2026-01-15T08:00:00.000Z",
        planningRunId: "run-id",
        counts: {
          blocked: 1,
          deferred: 1,
          ready: 2,
          total: 4
        },
        items: []
      }).map((item) => `${item.label}:${item.value}`)
    ).toEqual(["Ready:2", "Blocked:1", "Deferred:1"]);
    expect(
      buildRecommendationMetrics({
        planningRunId: "run-id",
        runNumber: "RUN-001",
        status: "Completed",
        recommendations: []
      }).map((item) => item.label)
    ).toEqual(["Ready packages", "Cannot package yet", "Decision history"]);
    expect(
      buildOperationsMetrics(
        {
          checkedAtUtc: "2026-01-15T08:00:00.000Z",
          databaseConfigured: true,
          freshness: "stale",
          latestImport: null,
          signals: [],
          state: "stale",
          status: "ready",
          summary: "Latest synthetic import includes stale rows."
        },
        {
          blockedCount: 0,
          checkedAtUtc: "2026-01-15T08:00:00.000Z",
          databaseConfigured: true,
          databaseReachable: true,
          latestImport: null,
          needsReviewCount: 0,
          readyCount: 1,
          status: "ready",
          summary: "Source-data persistence is reachable for review."
        },
        {
          blockedPackageCount: 0,
          checkedAtUtc: "2026-01-15T08:00:00.000Z",
          deferredDecisionCount: 0,
          label: "Baseline Week",
          latestImport: null,
          packageCount: 1,
          planningRunId: "run-id",
          readyPackageCount: 1,
          runNumber: "RUN-001",
          scenarioId: "baseline-week",
          signals: [],
          status: "healthy",
          statusText: "Healthy",
          summary: "Operations evidence is available."
        }
      ).map((item) => item.label)
    ).toEqual(["Posture", "Source-data readiness", "Latest scenario"]);
    expect(
      buildScenarioOutcomeMetrics({
        generatedAtUtc: "2026-01-15T08:00:00.000Z",
        latest: {
          blockedPackageCount: 0,
          checkedAtUtc: "2026-01-15T08:00:00.000Z",
          deferredDecisionCount: 0,
          label: "Baseline Week",
          latestImport: null,
          packageCount: 1,
          planningRunId: "run-id",
          readyPackageCount: 1,
          runNumber: "RUN-001",
          scenarioId: "baseline-week",
          signals: [],
          status: "healthy",
          statusText: "Healthy",
          summary: "Operations evidence is available."
        },
        outcomes: [
          {
            blockedPackageCount: 0,
            checkedAtUtc: "2026-01-15T08:00:00.000Z",
            deferredDecisionCount: 0,
            label: "Baseline Week",
            latestImport: null,
            packageCount: 1,
            planningRunId: "run-id",
            readyPackageCount: 1,
            runNumber: "RUN-001",
            scenarioId: "baseline-week",
            signals: [],
            status: "healthy",
            statusText: "Healthy",
            summary: "Operations evidence is available."
          },
          {
            blockedPackageCount: 0,
            checkedAtUtc: "2026-01-15T08:00:00.000Z",
            deferredDecisionCount: 0,
            label: "Stale Scenario",
            latestImport: null,
            packageCount: 1,
            planningRunId: "run-id-2",
            readyPackageCount: 1,
            runNumber: "RUN-002",
            scenarioId: "stale-scenario",
            signals: [],
            status: "stale",
            statusText: "Stale data",
            summary: "Stale rows stayed visible."
          }
        ]
      }).map((item) => `${item.label}:${item.value}`)
    ).toEqual(["Healthy:1", "Stale data:1", "Needs attention:0"]);
  });

  it("explains blocked acceptance with recommendation blocker summaries", () => {
    expect(
      acceptDisabledReason({
        blockers: [
          {
            category: "source-data",
            code: "missing-estimate",
            severity: "blocking",
            summary: "Work order WO-1000 has no estimate.",
            workOrderNumbers: ["WO-1000"]
          }
        ],
        decisions: [],
        estimatedHours: 0,
        explanation: {
          actionability: "blocked",
          blockerSummaries: ["Work order WO-1000 has no estimate."],
          readinessSummary: "Source data has blockers.",
          score: 82,
          text: "Acceptance is blocked until source data is corrected."
        },
        packageId: "60000000-0000-4000-8000-000000002001",
        packageNumber: "PKG-BLOCKED-001",
        score: 82,
        sourceDataReadiness: {
          blockedCount: 1,
          needsReviewCount: 0,
          readyCount: 0,
          status: "blocked",
          summary: "Source data has blockers."
        },
        status: "Blocked",
        actionability: "blocked",
        title: "Blocked package",
        workOrders: []
      })
    ).toBe("Cannot accept yet: Work order WO-1000 has no estimate.");
  });

  it("formats state badges without duplicated equivalent labels", () => {
    const blockedRecommendation = {
      sourceDataReadiness: {
        blockedCount: 1,
        needsReviewCount: 0,
        readyCount: 0,
        status: "blocked" as const,
        summary: "Source data has blockers."
      },
      status: "Blocked"
    };
    const readyRecommendation = {
      sourceDataReadiness: {
        blockedCount: 0,
        needsReviewCount: 0,
        readyCount: 1,
        status: "ready" as const,
        summary: "Source data is ready."
      },
      status: "Recommended"
    };

    expect(recommendationStateBadgeSpecs(blockedRecommendation).map((badge) => badge.label)).toEqual([
      "Blocked"
    ]);
    expect(recommendationStateBadgeSpecs(readyRecommendation).map((badge) => badge.label)).toEqual([
      "Package Recommended",
      "Readiness Ready"
    ]);
    expect(workOrderStateBadgeSpecs({ plannerState: "ready", readinessStatus: "ready" }).map((badge) => badge.label)).toEqual([
      "Ready"
    ]);
    expect(workOrderStateBadgeSpecs({ plannerState: "deferred", readinessStatus: "ready" }).map((badge) => badge.label)).toEqual([
      "Readiness Ready",
      "Planner Deferred"
    ]);
    expect(formatStateLabel("NeedsPlannerReview")).toBe("Needs Planner Review");
  });

  it("preserves the base backlog row count while reporting search matches", () => {
    expect(
      formatBacklogResultSummary({
        baseRowCount: 2,
        filterLabel: "All",
        hasSearchQuery: false,
        searchMatchCount: 2,
        visibleRowCount: 2
      })
    ).toBe("2 shown from 2 all rows");
    expect(
      formatBacklogResultSummary({
        baseRowCount: 2,
        filterLabel: "All",
        hasSearchQuery: true,
        searchMatchCount: 0,
        visibleRowCount: 0
      })
    ).toBe("0 shown from 2 all rows after 0 search matches");
  });

  it("classifies unauthorized planner service errors for route states", () => {
    expect(toPlannerRouteIssue(new PlannerServiceRequestError(403, "Forbidden"))).toMatchObject({
      kind: "unauthorized",
      title: "Planner access needs attention"
    });
  });
});
