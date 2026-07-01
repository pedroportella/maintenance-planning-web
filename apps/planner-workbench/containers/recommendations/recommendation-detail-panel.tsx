import {
  PlannerActionLink,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerDataTable,
  PlannerDecisionSummary,
  PlannerEvidenceAccordion,
  PlannerMetadataPanel,
  PlannerPlainList,
  PlannerSummaryList,
  PlannerQuietNote,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
} from "@maintenance-planning/ui-library";
import type {
  PlannerDecisionRecord,
  PlannerRecommendation,
  WorkOrderBacklogItem
} from "@maintenance-planning/services";
import Link from "next/link";
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
import { packageRecommendationHref, recommendationsHref } from "./recommendation-links";
import {
  changeDecisionQuery,
  decisionKindFromLatest,
  deferActionCodeFromLatest,
  latestRecommendationDecision,
  recommendationDetailQuery,
  recommendationQueueDecisionQuery
} from "./recommendation-decision-state";

type RecommendationDetailPanelProps = {
  isChangingDecision?: boolean;
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
  isChangingDecision = false,
  recommendation,
  planningRunId
}: RecommendationDetailPanelProps) {
  const headingId = `recommendation-detail-${recommendation.packageId}`;
  const latestDecision = latestRecommendationDecision(recommendation);

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
      eyebrow="Package recommendation"
      title="Recommendation decision review"
      titleId={headingId}
      variant="surface"
    >
      <PlannerEvidenceAccordion
        ariaLabel={`${recommendation.packageNumber} recommendation evidence`}
        defaultValue={getDefaultEvidenceSections({
          isChangingDecision,
          latestDecision,
          recommendation
        })}
        items={buildEvidenceItems(recommendation, latestDecision)}
        type="multiple"
      />

      <RecommendationDecisionState
        isChangingDecision={isChangingDecision}
        latestDecision={latestDecision}
        planningRunId={planningRunId}
        recommendation={recommendation}
      />
    </PlannerContentSection>
  );
}

function buildEvidenceItems(
  recommendation: PlannerRecommendation,
  latestDecision?: PlannerDecisionRecord
) {
  return [
    {
      badge: (
        <PlannerStatusBadge tone="info">
          Score {recommendation.score}
        </PlannerStatusBadge>
      ),
      children: (
        <RecommendationExplanation recommendation={recommendation} />
      ),
      summary: `${formatHours(recommendation.estimatedHours)} across ${recommendation.workOrders.length} work orders.`,
      title: "Why this package",
      value: "recommendation-explanation"
    },
    {
      badge: (
        <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
          {recommendation.sourceDataReadiness.status}
        </PlannerStatusBadge>
      ),
      children: (
        <RecommendationReadiness recommendation={recommendation} />
      ),
      summary: recommendation.sourceDataReadiness.summary,
      title: "Source-data readiness",
      value: "source-readiness"
    },
    {
      children: (
        <PlannerDataTable
          caption={`${recommendation.packageNumber} work orders`}
          columns={workOrderColumns}
          density="compact"
          description={`Use the work-order row header, readiness, asset context, hours and due-date columns to review the work included in ${recommendation.packageNumber}.`}
          getRowKey={(item) => item.id}
          rows={recommendation.workOrders}
        />
      ),
      summary: `${recommendation.workOrders.length} rows, ${formatHours(recommendation.estimatedHours)} total.`,
      title: `Work orders (${recommendation.workOrders.length})`,
      value: "work-orders"
    },
    {
      badge: latestDecision ? (
        <PlannerStatusBadge tone={toneForDecision(latestDecision.decision)}>
          {latestDecision.decision}
        </PlannerStatusBadge>
      ) : undefined,
      children: (
        <RecommendationDecisionHistory decisions={recommendation.decisions} />
      ),
      summary: latestDecision
        ? `Latest ${latestDecision.decision} for ${latestDecision.reasonCode}.`
        : "No decision recorded yet.",
      title: `Decision history (${recommendation.decisions.length})`,
      value: "decision-history"
    }
  ];
}

function getDefaultEvidenceSections({
  isChangingDecision,
  latestDecision,
  recommendation
}: {
  isChangingDecision: boolean;
  latestDecision?: PlannerDecisionRecord;
  recommendation: PlannerRecommendation;
}) {
  if (latestDecision && !isChangingDecision) {
    return [];
  }

  if (recommendation.blockers.length > 0) {
    return ["source-readiness"];
  }

  return ["recommendation-explanation"];
}

function RecommendationExplanation({
  recommendation
}: {
  recommendation: PlannerRecommendation;
}) {
  return (
    <>
      <p>{recommendation.explanation.text}</p>
      <PlannerSummaryList
        ariaLabel={`${recommendation.packageNumber} explanation facts`}
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
          }
        ]}
        variant="compact"
      />
    </>
  );
}

function RecommendationReadiness({
  recommendation
}: {
  recommendation: PlannerRecommendation;
}) {
  return (
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
    />
  );
}

function RecommendationDecisionState({
  isChangingDecision,
  latestDecision,
  planningRunId,
  recommendation
}: {
  isChangingDecision: boolean;
  latestDecision?: PlannerDecisionRecord;
  planningRunId: string;
  recommendation: PlannerRecommendation;
}) {
  const detailHref = packageRecommendationHref(
    recommendation.packageId,
    recommendationDetailQuery(planningRunId)
  );

  if (latestDecision && !isChangingDecision) {
    return (
      <PlannerDecisionSummary
        actions={
          <>
            <PlannerActionLink asChild>
              <Link
                href={recommendationsHref(
                  recommendationQueueDecisionQuery(recommendation, latestDecision)
                )}
              >
                Back to queue
              </Link>
            </PlannerActionLink>
            <PlannerActionLink asChild priority="secondary">
              <Link
                href={packageRecommendationHref(
                  recommendation.packageId,
                  changeDecisionQuery(planningRunId)
                )}
              >
                Change decision
              </Link>
            </PlannerActionLink>
          </>
        }
        decidedAt={formatUtc(latestDecision.decidedAtUtc)}
        decidedBy={latestDecision.decidedBy}
        decision={latestDecision.decision}
        note={latestDecision.notes}
        packageNumber={recommendation.packageNumber}
        reason={latestDecision.reasonCode}
        summary={`${latestDecision.decision} for ${latestDecision.reasonCode} on ${formatUtc(
          latestDecision.decidedAtUtc
        )}.`}
        titleId={`latest-decision-${recommendation.packageId}`}
        tone={toneForDecision(latestDecision.decision)}
      />
    );
  }

  return (
    <RecommendationDecisionForm
      defaultDecision={decisionKindFromLatest(latestDecision)}
      defaultDeferActionCode={deferActionCodeFromLatest(latestDecision)}
      planningRunId={planningRunId}
      recommendation={recommendation}
      secondaryAction={
        latestDecision ? (
          <Link href={detailHref}>Cancel change</Link>
        ) : (
          <Link href="/recommendations">Back to queue</Link>
        )
      }
      title={latestDecision ? "Change decision" : undefined}
    />
  );
}

function RecommendationDecisionHistory({
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
  );
}
