import {
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn,
  type PlannerDecisionPanelAction,
  type PlannerDecisionPanelBlocker,
  type PlannerStatusTone,
  type PlannerSummaryListItem
} from "@maintenance-planning/ui-library";
import type {
  OperationsSignalView,
  PlannerRecommendation,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import { plannerDecisionActions } from "@/lib/planner-decisions";
import {
  acceptDisabledReason,
  formatHours,
  formatUtc,
  isReadyRecommendation,
  toneForPostureState,
  toneForReadiness
} from "@/lib/planner-format";

type ToneExample = {
  readonly detail: string;
  readonly label: string;
  readonly tone: PlannerStatusTone;
};

export const toneExamples: readonly ToneExample[] = [
  {
    detail: "Critical blockers or request failures.",
    label: "Critical",
    tone: "critical"
  },
  {
    detail: "Informational review context.",
    label: "Info",
    tone: "info"
  },
  {
    detail: "Quiet secondary metadata.",
    label: "Neutral",
    tone: "neutral"
  },
  {
    detail: "Ready or completed synthetic states.",
    label: "Success",
    tone: "success"
  },
  {
    detail: "Planner attention without a hard stop.",
    label: "Warning",
    tone: "warning"
  }
];

export const layoutFixtureNavItems = [
  {
    description: "Package decisions",
    group: "Review",
    href: "/recommendations",
    label: "Recommendations"
  },
  {
    description: "Work-order triage",
    group: "Review",
    href: "/work-order-backlog",
    label: "Work-order backlog"
  },
  {
    description: "Run context",
    group: "Evidence",
    href: "/planning-runs",
    label: "Planning runs"
  }
] as const;

export const signalColumns: readonly PlannerDataTableColumn<OperationsSignalView>[] = [
  {
    header: "Signal",
    key: "signal",
    render: (signal) => (
      <PlannerTableCellStack detail={signal.summary} title={signal.label} />
    )
  },
  {
    header: "State",
    key: "state",
    render: (signal) => (
      <PlannerStatusBadge tone={toneForPostureState(signal.status)}>
        {signal.status}
      </PlannerStatusBadge>
    )
  },
  {
    header: "Detail",
    key: "detail",
    render: (signal) => signal.detail ?? "No extra detail"
  },
  {
    align: "end",
    header: "Checked",
    key: "checked",
    render: (signal) => formatUtc(signal.checkedAtUtc)
  }
];

export const workOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
  {
    header: "Work order",
    key: "work-order",
    render: (item) => (
      <PlannerTableCellStack detail={item.title} title={item.workOrderNumber} />
    ),
    rowHeader: true
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (item) => (
      <PlannerStatusBadge tone={toneForReadiness(item.readinessStatus)}>
        {item.readinessStatus}
      </PlannerStatusBadge>
    )
  },
  {
    header: "Issue",
    key: "issue",
    render: (item) => item.readinessIssueCode ?? "Ready for review"
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (item) => formatHours(item.estimatedHours)
  }
];

export const controlledWorkOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
  {
    ...workOrderColumns[0],
    sortable: true,
    sortLabel: "Sort by work order"
  },
  workOrderColumns[1],
  workOrderColumns[2],
  {
    ...workOrderColumns[3],
    sortable: true,
    sortLabel: "Sort by estimated hours"
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc),
    sortable: true,
    sortLabel: "Sort by due date"
  }
];

export const overflowingWorkOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
  ...workOrderColumns,
  {
    header: "Package",
    key: "package",
    render: (item) => (
      <PlannerTableCellStack detail={item.packageTitle} title={item.packageNumber} />
    )
  },
  {
    header: "Priority",
    key: "priority",
    render: (item) => item.priority
  },
  {
    header: "Lifecycle",
    key: "lifecycle",
    render: (item) => item.lifecycleStatus
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc)
  }
];

export function buildShowcaseDecisionActions(
  recommendation: PlannerRecommendation
): readonly PlannerDecisionPanelAction[] {
  const readyForAcceptance = isReadyRecommendation(recommendation);

  return plannerDecisionActions.map((action) =>
    action.decision === "Accepted"
      ? {
          ...action,
          disabled: !readyForAcceptance,
          disabledDescription: acceptDisabledReason(recommendation)
        }
      : action
  );
}

export function buildShowcaseDecisionBlockers(
  recommendation: PlannerRecommendation
): readonly PlannerDecisionPanelBlocker[] {
  return recommendation.blockers.map((blocker, index) => ({
    id: `${blocker.code}-${index}`,
    label: blocker.code,
    summary: blocker.summary
  }));
}

export function buildShowcaseDecisionFacts(
  recommendation: PlannerRecommendation
): readonly PlannerSummaryListItem[] {
  return [
    {
      id: "package",
      label: "Package",
      value: recommendation.packageNumber
    },
    {
      id: "readiness",
      label: "Readiness",
      tone: toneForReadiness(recommendation.sourceDataReadiness.status),
      value: recommendation.sourceDataReadiness.status
    },
    {
      id: "work-orders",
      label: "Work orders",
      value: recommendation.workOrders.length
    },
    {
      id: "estimated-work",
      label: "Estimated work",
      value: formatHours(recommendation.estimatedHours)
    }
  ];
}
