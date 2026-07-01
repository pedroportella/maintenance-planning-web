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
    const decision = readRecommendationSearchParam(params, "decision");
    const packageNumber = readRecommendationSearchParam(params, "packageNumber");
    const reasonCode = readRecommendationSearchParam(params, "reasonCode");
    const title =
      decision && packageNumber
        ? `${decision} ${packageNumber}`
        : "Decision recorded";

    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert role="status" title={title} tone="success">
          <p>
            {reasonCode ? `Latest decision: ${reasonCode}. ` : ""}
            The package queue has been updated.
          </p>
        </PlannerAlert>
      </div>
    );
  }

  if (result === "unauthorized") {
    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert role="alert" title="Decision was not recorded" tone="critical">
          <p>Planner access needs attention before a decision can be recorded.</p>
        </PlannerAlert>
      </div>
    );
  }

  if (result === "error") {
    return (
      <div className="planner-decision-notice-focus" ref={noticeRef} tabIndex={-1}>
        <PlannerAlert role="alert" title="Decision was not recorded" tone="critical">
          <p>The decision could not be saved. Review the form and try again.</p>
        </PlannerAlert>
      </div>
    );
  }

  return null;
}
