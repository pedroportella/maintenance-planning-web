"use server";

import { createPlannerServices } from "@maintenance-planning/services";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  normaliseDecisionNotes,
  resolvePlannerDecisionAction
} from "@/lib/planner-decisions";
import { toPlannerRouteIssue } from "@/lib/planner-route-state";

export async function recordRecommendationDecision(formData: FormData) {
  let redirectPath: string;

  try {
    const packageId = requireFormText(formData, "packageId");
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
    revalidatePath("/work-order-backlog");

    redirectPath = buildDecisionRedirect({
      decision: action.decision,
      decisionResult: "success",
      packageNumber: result.packageNumber
    });
  } catch (error) {
    const issue = toPlannerRouteIssue(error);

    redirectPath = buildDecisionRedirect({
      decisionResult: issue.kind === "unauthorized" ? "unauthorized" : "error"
    });
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

function buildDecisionRedirect(params: Record<string, string>) {
  return `/recommendations?${new URLSearchParams(params).toString()}`;
}
