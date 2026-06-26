import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerDataTable,
  PlannerMetadataPanel,
  PlannerPlainList,
  PlannerResponsiveGrid,
  PlannerSummaryList,
  PlannerQuietNote,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
} from "@maintenance-planning/ui-library";
import type {
  PlannerDecisionRecord,
  PlannerRecommendation,
  RecommendationBlockerView,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import {
  formatHours,
  formatUtc,
  formatStateLabel,
  recommendationStateBadgeSpecs,
  toneForDecision,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { decisionHistoryItemKey } from "@/lib/decision-history";
import { RecommendationDecisionForm } from "./recommendation-decision-form";

type RecommendationDetailPanelProps = {
  recommendation: PlannerRecommendation;
  planningRunId: string;
};

const workOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
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
    header: "Asset context",
    key: "asset",
    render: (item) => item.assetName ?? item.functionalLocationName ?? "Not supplied"
  },
  {
    align: "end",
    header: "Hours",
    key: "hours",
    render: (item) => formatHours(item.estimatedHours)
  },
  {
    align: "end",
    header: "Due",
    key: "due",
    render: (item) => formatUtc(item.dueAtUtc)
  }
];

export function RecommendationDetailPanel({
  recommendation,
  planningRunId
}: RecommendationDetailPanelProps) {
  const headingId = `recommendation-detail-${recommendation.packageId}`;

  return (
    <PlannerContentSection
      as="article"
      badge={
        <PlannerBadgeGroup align="end">
          {recommendationStateBadgeSpecs(recommendation).map((badge) => (
            <PlannerStatusBadge key={badge.id} tone={badge.tone}>
              {badge.label}
            </PlannerStatusBadge>
          ))}
        </PlannerBadgeGroup>
      }
      description={recommendation.title}
      eyebrow="Package recommendation"
      title="Why this package"
      titleId={headingId}
      variant="surface"
    >

      <PlannerSummaryList
        ariaLabel={`${recommendation.packageNumber} summary`}
        items={[
          {
            id: "score",
            label: "Score",
            tone: "info",
            value: recommendation.score
          },
          {
            id: "actionability",
            label: "Actionability",
            tone: toneForStatus(recommendation.actionability),
            value: formatStateLabel(recommendation.actionability)
          },
          {
            id: "estimated-work",
            label: "Estimated work",
            value: formatHours(recommendation.estimatedHours)
          },
          {
            id: "blockers",
            label: "Blockers",
            tone: recommendation.blockers.length > 0 ? "warning" : "success",
            value: recommendation.blockers.length
          },
          {
            id: "work-orders",
            label: "Work orders",
            value: recommendation.workOrders.length
          }
        ]}
        variant="compact"
      />

      <PlannerResponsiveGrid balance="secondary">
        <PlannerContentSection
          title="Recommendation explanation"
          titleId={`${headingId}-explanation`}
        >
          <p>{recommendation.explanation.text}</p>
        </PlannerContentSection>

        <PlannerMetadataPanel
          description={recommendation.sourceDataReadiness.summary}
          density="compact"
          items={[
            {
              id: "ready",
              label: "Ready",
              tone: "success",
              value: recommendation.sourceDataReadiness.readyCount
            },
            {
              id: "review",
              label: "Review",
              tone: "warning",
              value: recommendation.sourceDataReadiness.needsReviewCount
            },
            {
              id: "blocked",
              label: "Blocked",
              tone: "critical",
              value: recommendation.sourceDataReadiness.blockedCount
            }
          ]}
          summaryAriaLabel={`${recommendation.packageNumber} source-data readiness facts`}
          title="Source-data readiness"
          titleId={`${headingId}-source-readiness`}
        />
      </PlannerResponsiveGrid>

      <RecommendationBlockers blockers={recommendation.blockers} />

      <PlannerDataTable
        caption={`${recommendation.packageNumber} work orders`}
        columns={workOrderColumns}
        density="compact"
        description={`Use the work-order row header, readiness, asset context, hours and due-date columns to review the work included in ${recommendation.packageNumber}.`}
        getRowKey={(item) => item.id}
        rows={recommendation.workOrders}
      />

      <RecommendationDecisions decisions={recommendation.decisions} />

      <RecommendationDecisionForm
        planningRunId={planningRunId}
        recommendation={recommendation}
      />
    </PlannerContentSection>
  );
}

function RecommendationBlockers({ blockers }: { blockers: readonly RecommendationBlockerView[] }) {
  if (blockers.length === 0) {
    return (
      <PlannerQuietNote title="No package blockers">
        Service-owned constraints do not show a blocker for this package group.
      </PlannerQuietNote>
    );
  }

  return (
    <PlannerAlert title="Package blockers" tone="warning">
      <PlannerPlainList>
        {blockers.map((blocker, index) => (
          <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}-${index}`}>
            <strong>{blocker.code}</strong>: {blocker.summary}
          </li>
        ))}
      </PlannerPlainList>
    </PlannerAlert>
  );
}

function RecommendationDecisions({
  decisions
}: {
  decisions: readonly PlannerDecisionRecord[];
}) {
  if (decisions.length === 0) {
    return (
      <PlannerQuietNote title="No decision recorded">
        Record a planner decision when this recommendation has been reviewed.
      </PlannerQuietNote>
    );
  }

  return (
    <PlannerContentSection
      title="Decision history"
      titleId="planner-decision-history"
    >
      <PlannerPlainList>
        {decisions.map((decision, index) => (
          <li key={decisionHistoryItemKey(decision, index)}>
            <PlannerStatusBadge tone={toneForDecision(decision.decision)}>
              {decision.decision}
            </PlannerStatusBadge>
            <span>{decision.reasonCode}</span>
            <small>{formatUtc(decision.decidedAtUtc)}</small>
          </li>
        ))}
      </PlannerPlainList>
    </PlannerContentSection>
  );
}
