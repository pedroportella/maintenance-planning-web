"use client";

import { PlannerAlert } from "@maintenance-planning/ui-library";
import { useEffect, useRef } from "react";
import {
  readRecommendationSearchParam,
  type RecommendationSearchParams
} from "./recommendation-search-params";

export function RecommendationDecisionNotice({
  params
}: {
  params: RecommendationSearchParams;
}) {
  const result = readRecommendationSearchParam(params, "decisionResult");
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      window.requestAnimationFrame(() => noticeRef.current?.focus());
    }
  }, [result]);

  if (result === "success") {
    const decision = readRecommendationSearchParam(params, "decision") ?? "Decision";
    const packageNumber = readRecommendationSearchParam(params, "packageNumber") ?? "the package";

    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert title="Decision recorded" tone="success">
          <p>
            Latest decision: {decision} for {packageNumber}. The package queue has been updated.
          </p>
        </PlannerAlert>
      </div>
    );
  }

  if (result === "unauthorized") {
    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert title="Decision was not recorded" tone="critical">
          <p>Planner access needs attention before a decision can be recorded.</p>
        </PlannerAlert>
      </div>
    );
  }

  if (result === "error") {
    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert title="Decision was not recorded" tone="critical">
          <p>The decision could not be saved. Review the form and try again.</p>
        </PlannerAlert>
      </div>
    );
  }

  return null;
}
