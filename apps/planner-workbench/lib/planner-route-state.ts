import {
  PlannerServiceRequestError,
  ServiceConfigurationError
} from "@maintenance-planning/services";

export type PlannerRouteIssue = {
  readonly description: string;
  readonly kind: "configuration" | "request" | "unauthorized" | "unknown";
  readonly title: string;
};

export function toPlannerRouteIssue(error: unknown): PlannerRouteIssue {
  if (error instanceof PlannerServiceRequestError) {
    if (error.status === 401 || error.status === 403) {
      return {
        description:
          "Planner access needs attention before this review state can be loaded or changed.",
        kind: "unauthorized",
        title: "Planner access needs attention"
      };
    }

    return {
      description:
        "The planner service returned an error while preparing this synthetic review state.",
      kind: "request",
      title: "Planner data could not be loaded"
    };
  }

  if (error instanceof ServiceConfigurationError) {
    return {
      description:
        "The planner workbench runtime configuration needs to be completed before this route can load.",
      kind: "configuration",
      title: "Planner runtime is not configured"
    };
  }

  return {
    description: "The route could not prepare the planner review state.",
    kind: "unknown",
    title: "Planner route could not load"
  };
}
