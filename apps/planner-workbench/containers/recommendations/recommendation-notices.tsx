import { Alert } from "@maintenance-planning/ui-library";

export type RecommendationSearchParams = Record<string, string | string[] | undefined>;

export function RecommendationDecisionNotice({
  params
}: {
  params: RecommendationSearchParams;
}) {
  const result = readRecommendationSearchParam(params, "decisionResult");

  if (result === "success") {
    const decision = readRecommendationSearchParam(params, "decision") ?? "Decision";
    const packageNumber = readRecommendationSearchParam(params, "packageNumber") ?? "the package";

    return (
      <Alert title="Decision recorded" tone="success">
        <p>
          {decision} was recorded for {packageNumber} through the planner service boundary.
        </p>
      </Alert>
    );
  }

  if (result === "unauthorized") {
    return (
      <Alert title="Decision was not recorded" tone="critical">
        <p>Planner access needs attention before a decision can be recorded.</p>
      </Alert>
    );
  }

  if (result === "error") {
    return (
      <Alert title="Decision was not recorded" tone="critical">
        <p>The planner service could not record the decision. Review the input and try again.</p>
      </Alert>
    );
  }

  return null;
}

export function readRecommendationSearchParam(
  params: RecommendationSearchParams,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}
