"use server";

import { createPlannerServices } from "@maintenance-planning/services";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  normaliseDecisionNotes,
  resolvePlannerDecisionAction
} from "@/lib/planner-decisions";
import { toPlannerRouteIssue } from "@/lib/planner-route-state";
import { packageRecommendationHref } from "./recommendation-links";

export async function recordRecommendationDecision(formData: FormData) {
  let packageIdForRedirect: string | undefined;
  let planningRunIdForRedirect: string | undefined;
  let redirectPath: string;

  try {
    const packageId = requireFormText(formData, "packageId");
    const planningRunId = readOptionalFormText(formData, "planningRunId");
    packageIdForRedirect = packageId;
    planningRunIdForRedirect = planningRunId;

    const action = resolvePlannerDecisionAction(requireFormText(formData, "actionCode"));
    const workOrderIds = formData
      .getAll("workOrderIds")
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    if (workOrderIds.length === 0) {
      throw new Error("At least one work order is required before recording a decision.");
    }

    const result = await createPlannerServices().recordPlannerDecision({
      decidedBy: "planner-workbench",
      decision: action.decision,
      notes: normaliseDecisionNotes(formData.get("notes")),
      packageId,
      reasonCode: action.reasonCode,
      workOrderIds
    });

    revalidatePath("/recommendations");
    revalidatePath(`/recommendations/${packageId}`);
    revalidatePath("/work-order-backlog");
    revalidatePath("/coordination-exceptions");
    if (planningRunId) {
      revalidatePath(`/planning-runs/${planningRunId}`);
    }

    redirectPath = buildDecisionRedirect(
      {
        decision: action.decision,
        decisionResult: "success",
        packageNumber: result.packageNumber
      },
      packageId,
      planningRunId
    );
  } catch (error) {
    const issue = toPlannerRouteIssue(error);

    redirectPath = buildDecisionRedirect(
      {
        decisionResult: issue.kind === "unauthorized" ? "unauthorized" : "error"
      },
      packageIdForRedirect,
      planningRunIdForRedirect
    );
  }

  redirect(redirectPath);
}

function requireFormText(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing form field: ${key}`);
  }

  return value.trim();
}

function readOptionalFormText(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function buildDecisionRedirect(
  params: Record<string, string>,
  packageId?: string,
  planningRunId?: string
) {
  const queryParams = planningRunId
    ? {
        ...params,
        planningRunId
      }
    : params;

  if (!packageId) {
    return `/recommendations?${new URLSearchParams(queryParams).toString()}`;
  }

  return packageRecommendationHref(packageId, queryParams);
}
