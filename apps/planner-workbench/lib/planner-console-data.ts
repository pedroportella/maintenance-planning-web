import type { MetricSummaryItem, SegmentedNavOption, Tone } from "@maintenance-planning/ui-library";
import type { WorkbenchSectionSlug } from "@maintenance-planning/utils";

export type CoordinationQueueItem = {
  due: string;
  issue: string;
  packageNumber: string;
  priority: string;
  readiness: string;
  routeSlug: WorkbenchSectionSlug;
  statusTone: Tone;
  title: string;
  workOrderNumber: string;
};

export const plannerConsoleSummary: readonly MetricSummaryItem[] = [
  {
    detail: "Synthetic work orders with missing or moved planning details.",
    label: "Needs coordination",
    tone: "warning",
    value: "5"
  },
  {
    detail: "Items ready for later recommendation review.",
    label: "Ready without blocker",
    tone: "success",
    value: "3"
  },
  {
    detail: "Local examples held for a later planning pass.",
    label: "Deferred for review",
    tone: "info",
    value: "2"
  }
] as const;

export const plannerConsoleSections: readonly SegmentedNavOption[] = [
  {
    href: "#coordination-queue",
    label: "Queue",
    selected: true
  },
  {
    href: "#route-map",
    label: "Route map"
  }
] as const;

export const coordinationQueueItems: readonly CoordinationQueueItem[] = [
  {
    due: "2 Feb",
    issue: "Planning window moved after import.",
    packageNumber: "PKG-EVENT-REPLAN",
    priority: "High",
    readiness: "Window review",
    routeSlug: "coordination-exceptions",
    statusTone: "warning",
    title: "Confirm access window",
    workOrderNumber: "WO-2101"
  },
  {
    due: "18 Jan",
    issue: "Estimated effort is missing.",
    packageNumber: "PKG-BASE-REVIEW",
    priority: "Medium",
    readiness: "Source data gap",
    routeSlug: "work-order-backlog",
    statusTone: "warning",
    title: "Add effort estimate",
    workOrderNumber: "WO-2001"
  },
  {
    due: "13 Mar",
    issue: "Equipment reference needs confirmation.",
    packageNumber: "PKG-PARTS-BLOCKED",
    priority: "Medium",
    readiness: "Needs detail",
    routeSlug: "work-order-backlog",
    statusTone: "info",
    title: "Review equipment context",
    workOrderNumber: "WO-2201"
  },
  {
    due: "13 Mar",
    issue: "Priority and work-center context are incomplete.",
    packageNumber: "PKG-PARTS-BLOCKED",
    priority: "Medium",
    readiness: "Needs detail",
    routeSlug: "coordination-exceptions",
    statusTone: "info",
    title: "Confirm planning context",
    workOrderNumber: "WO-2202"
  },
  {
    due: "12 Mar",
    issue: "Review remains deferred for a later planning pass.",
    packageNumber: "PKG-PARTS-REPLAN",
    priority: "Low",
    readiness: "Deferred",
    routeSlug: "recommendations",
    statusTone: "neutral",
    title: "Recheck deferred package",
    workOrderNumber: "WO-2200"
  }
] as const;
