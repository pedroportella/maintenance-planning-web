import type { Metadata } from "next";
import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerCheckbox,
  PlannerAppLayout,
  PlannerContentSection,
  PlannerDataTable,
  PlannerDecisionPanel,
  PlannerEmptyState,
  PlannerFilterToolbar,
  PlannerLoadingState,
  PlannerMetadataPanel,
  PlannerMetricSummary,
  PlannerPage,
  PlannerPageHeader,
  PlannerPagination,
  PlannerPlainList,
  PlannerQuietNote,
  PlannerRadioCards,
  PlannerRadioGroup,
  PlannerResponsiveGrid,
  PlannerSelect,
  PlannerSideNav,
  PlannerStatusBadge,
  PlannerStatusPill,
  PlannerSummaryList,
  PlannerTableCellStack,
  PlannerTextArea,
  PlannerTextInput,
  PlannerWorkflowLayout,
  RadixBadge,
  RadixButton,
  RadixCallout,
  RadixHeading,
  RadixIcon,
  RadixLink,
  RadixText,
  type PlannerDataTableColumn,
  type PlannerStatusTone
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type OperationsSignalView,
  type PlannerRecommendation,
  type WorkOrderBacklogItem
} from "@maintenance-planning/services";
import {
  buildOperationsMetrics,
  formatHours,
  formatUtc,
  isReadyRecommendation,
  toneForPostureState,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";
import { plannerDecisionActions } from "@/lib/planner-decisions";

export const metadata: Metadata = {
  title: "UI Library Evidence | Planner Workbench",
  description: "Reviewer and developer evidence for synthetic planner workbench UI states.",
  robots: {
    follow: false,
    index: false
  }
};

export const dynamic = "force-static";

type ToneExample = {
  readonly detail: string;
  readonly label: string;
  readonly tone: PlannerStatusTone;
};

const toneExamples: readonly ToneExample[] = [
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

const layoutFixtureNavItems = [
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

const signalColumns: readonly PlannerDataTableColumn<OperationsSignalView>[] = [
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

const controlledWorkOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
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

const overflowingWorkOrderColumns: readonly PlannerDataTableColumn<WorkOrderBacklogItem>[] = [
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

export default async function UiLibraryPage() {
  const partsDelayServices = createPlannerServices({
    config: {
      mockScenarioId: "parts-delay-replan",
      mode: "mock"
    }
  });

  const [recommendationSet, backlog, posture, sourceReadiness, scenarioSummary] =
    await Promise.all([
      partsDelayServices.getRecommendationSet(),
      partsDelayServices.getWorkOrderBacklog(),
      partsDelayServices.getOperationsPosture(),
      partsDelayServices.getSourceDataReadiness(),
      partsDelayServices.getScenarioOutcomeSummary()
    ]);
  const readyDecisionRecommendation =
    recommendationSet.recommendations.find((recommendation) => isReadyRecommendation(recommendation)) ??
    recommendationSet.recommendations[0];
  const blockedDecisionRecommendation =
    recommendationSet.recommendations.find((recommendation) => !isReadyRecommendation(recommendation)) ??
    readyDecisionRecommendation;

  return (
    <PlannerPage id="ui-library-main" labelledBy="ui-library-title">
      <PlannerPageHeader
        badge={
          <PlannerBadgeGroup>
            <PlannerStatusBadge tone="info">Reviewer evidence</PlannerStatusBadge>
            <PlannerStatusBadge tone="neutral">Static mock data</PlannerStatusBadge>
          </PlannerBadgeGroup>
        }
        description="Focused visual and accessibility evidence for reusable synthetic planner workbench states."
        eyebrow="Developer route"
        title="UI library showcase"
        titleId="ui-library-title"
      />

      <PlannerAlert title="Route scope" tone="info">
        <p>
          This page is an internal reviewer and developer aid. It uses checked synthetic fixtures
          and does not call a backend service.
        </p>
      </PlannerAlert>

      <PlannerContentSection
        badge={<PlannerStatusBadge tone="success">Radix theme provider</PlannerStatusBadge>}
        eyebrow="Theme foundation"
        title="Light, dark and system modes"
        titleId="showcase-theme-foundation"
        variant="surface"
      >
        <PlannerResponsiveGrid ariaLabel="Theme mode evidence">
          <PlannerAlert className="light" title="Light mode" tone="neutral">
            <p>Uses the planner light palette from shared tokens.</p>
          </PlannerAlert>
          <PlannerAlert className="dark" title="Dark mode" tone="neutral">
            <p>Uses the planner dark palette from shared tokens.</p>
          </PlannerAlert>
          <PlannerAlert title="System mode" tone="neutral">
            <p>Inherits the active document mode from the root theme provider.</p>
          </PlannerAlert>
        </PlannerResponsiveGrid>
      </PlannerContentSection>

      <PlannerContentSection
        badge={<RadixBadge tone="success">RU1</RadixBadge>}
        eyebrow="Adapter family"
        title="Radix fidelity adapters"
        titleId="showcase-radix-adapters"
        variant="surface"
      >
        <PlannerResponsiveGrid>
          <section aria-label="Radix typography and actions">
            <RadixHeading as="h3">Adapter primitives</RadixHeading>
            <RadixText as="p" tone="muted">
              Foundational controls render through the local ui-library boundary.
            </RadixText>
            <PlannerBadgeGroup as="div">
              <RadixButton>
                <RadixIcon name="check" />
                Apply
              </RadixButton>
              <RadixButton disabled tone="neutral" variant="soft">
                Disabled
              </RadixButton>
              <RadixLink href="#showcase-radix-adapters">Anchor link</RadixLink>
            </PlannerBadgeGroup>
          </section>
          <RadixCallout title="Form semantics" tone="info">
            Labels, hints, errors and described-by wiring are centralised in the adapter layer.
          </RadixCallout>
        </PlannerResponsiveGrid>
        <PlannerResponsiveGrid>
          <PlannerTextInput
            hint="Search by package or work-order text."
            label="Search"
            name="showcaseSearch"
            placeholder="Search review queue"
          />
          <PlannerSelect
            hint="Closed Radix selects keep the trigger and form value in the server markup."
            label="Reason"
            name="showcaseReason"
            options={[
              {
                label: "Parts readiness",
                value: "parts-readiness"
              },
              {
                label: "Crew capacity",
                value: "crew-capacity"
              }
            ]}
            placeholder="Choose reason"
          />
          <PlannerTextArea
            error="Add a short note before submitting this example."
            label="Decision notes"
            name="showcaseDecisionNotes"
            required
          />
          <PlannerCheckbox
            hint="Disabled example for form-state evidence."
            disabled
            label="I reviewed the recommendation"
            name="showcaseReviewed"
          />
        </PlannerResponsiveGrid>
        <PlannerRadioCards
          defaultValue="approve"
          hint="Card-style radio options use Radix radio-card semantics."
          label="Decision"
          name="showcaseDecision"
          options={[
            {
              hint: "Record the package as ready.",
              label: "Approve",
              value: "approve"
            },
            {
              hint: "Return the package for more review.",
              label: "Reject",
              value: "reject"
            },
            {
              hint: "Pause until blockers are resolved.",
              label: "Defer",
              value: "defer"
            }
          ]}
        />
        <PlannerRadioGroup
          hint="Linear radio groups keep individual option labels and hints."
          label="Follow-up"
          name="showcaseFollowUp"
          options={[
            {
              label: "No follow-up",
              value: "none"
            },
            {
              hint: "Use when another planner review is needed.",
              label: "Review needed",
              value: "review-needed"
            }
          ]}
        />
      </PlannerContentSection>

      <PlannerContentSection
        badge={<RadixBadge tone="success">RU2</RadixBadge>}
        description="Shell, page and workflow templates render through the Planner layout boundary."
        eyebrow="Layout family"
        title="App shell layout templates"
        titleId="showcase-layout-templates"
        variant="surface"
      >
        <PlannerAppLayout
          activeHref="/recommendations"
          brand={{
            ariaLabel: "Planner workbench home",
            href: "/",
            name: "Planner Workbench",
            tagline: "Synthetic planning review"
          }}
          className="planner-app-layout-fixture"
          contentId="showcase-shell-content"
          navAriaLabel="Planner shell fixture sections"
          navItems={layoutFixtureNavItems}
          sidebarNote="Layout fixtures use synthetic data and local navigation only."
        >
          <PlannerPageHeader
            actions={<RadixButton variant="soft">Review queue</RadixButton>}
            badge={<RadixBadge tone="info">Desktop shell</RadixBadge>}
            description="The route body sits behind a shell-owned header, grouped navigation and skip target."
            eyebrow="Shell fixture"
            title="Recommendation review"
            titleId="showcase-shell-title"
          />
          <PlannerContentSection
            badge={<RadixBadge tone="neutral">Template</RadixBadge>}
            description="Content sections carry recurring section headings without route-local shell CSS."
            title="Ready for planner review"
            titleId="showcase-shell-section"
          >
            <RadixCallout title="Boundary evidence" tone="info">
              The fixture keeps links and route state outside ui-library while layout behaviour stays
              inside the Planner templates.
            </RadixCallout>
          </PlannerContentSection>
        </PlannerAppLayout>

        <PlannerResponsiveGrid>
          <PlannerSideNav
            activeHref="/work-order-backlog"
            ariaLabel="Standalone side navigation fixture"
            items={layoutFixtureNavItems}
          />
          <PlannerWorkflowLayout
            actions={<RadixButton>Save decision</RadixButton>}
            backLink={<RadixLink href="/recommendations">Back to queue</RadixLink>}
            contextLabel="Decision workflow"
            lead="Workflow pages can reduce shell chrome while preserving heading, lead and action rhythm."
            progress={<RadixBadge tone="warning">Step 2 of 3</RadixBadge>}
            title="Package decision"
            titleId="showcase-workflow-title"
          >
            <RadixText as="p" tone="muted">
              The workflow template keeps task copy compact and leaves decision controls for RU6.
            </RadixText>
          </PlannerWorkflowLayout>
        </PlannerResponsiveGrid>
      </PlannerContentSection>

      <PlannerContentSection
        badge={<PlannerStatusBadge tone="neutral">All tones</PlannerStatusBadge>}
        eyebrow="Component family"
        title="Alerts and badges"
        titleId="showcase-alerts"
        variant="surface"
      >
        <PlannerResponsiveGrid>
          {toneExamples.map((example) => (
            <PlannerAlert key={example.tone} title={`${example.label} alert`} tone={example.tone}>
              <p>{example.detail}</p>
            </PlannerAlert>
          ))}
          <PlannerQuietNote title="Quiet note">
            Secondary review context stays visible without announcing as an alert.
          </PlannerQuietNote>
        </PlannerResponsiveGrid>
        <PlannerBadgeGroup ariaLabel="Status badge tone examples" as="section">
          {toneExamples.map((example) => (
            <PlannerStatusBadge key={example.tone} tone={example.tone}>
              {example.label}
            </PlannerStatusBadge>
          ))}
          {toneExamples.map((example) => (
            <PlannerStatusPill key={`${example.tone}-pill`} tone={example.tone}>
              {example.label} pill
            </PlannerStatusPill>
          ))}
        </PlannerBadgeGroup>
      </PlannerContentSection>

      <PlannerContentSection
        badge={<PlannerStatusBadge tone="success">RU4</PlannerStatusBadge>}
        eyebrow="Component family"
        title="Metadata and data lists"
        titleId="showcase-metadata"
        variant="surface"
      >
        <PlannerMetricSummary
          ariaLabel="Showcase metadata metric summary"
          items={[
            {
              detail: "Ready for planner review",
              label: "Ready packages",
              tone: "success",
              value: "12"
            },
            {
              detail: "Needs source-data review",
              label: "Review packages",
              tone: "warning",
              value: "4"
            },
            {
              detail: "Blocked by package facts",
              label: "Blocked packages",
              tone: "critical",
              value: "2"
            }
          ]}
          variant="compact"
        />
        <PlannerResponsiveGrid>
          <PlannerMetadataPanel
            badge={<PlannerStatusBadge tone="info">Desktop</PlannerStatusBadge>}
            description="Standard metadata panels use Radix DataList semantics for package facts."
            eyebrow="Metadata panel"
            items={[
              {
                id: "package",
                label: "Package",
                value: "PKG-PARTS-REPLAN"
              },
              {
                id: "score",
                label: "Score",
                tone: "info",
                value: "91"
              },
              {
                id: "estimated-work",
                label: "Estimated work",
                value: "48h"
              }
            ]}
            summaryAriaLabel="Desktop package metadata"
            title="Package facts"
            titleId="showcase-desktop-metadata"
          />
          <PlannerMetadataPanel
            badge={<PlannerStatusBadge tone="neutral">Tablet</PlannerStatusBadge>}
            density="compact"
            description="Compact metadata keeps repeated facts scannable inside constrained panels."
            eyebrow="Metadata panel"
            items={[
              {
                id: "run",
                label: "Run",
                value: "RUN-BASE-001"
              },
              {
                id: "freshness",
                label: "Freshness",
                tone: "success",
                value: "Current"
              },
              {
                id: "exceptions",
                label: "Exceptions",
                tone: "warning",
                value: "3"
              }
            ]}
            summaryAriaLabel="Tablet run metadata"
            title="Run facts"
            titleId="showcase-tablet-metadata"
          />
          <section aria-label="Phone metadata fixture">
            <h3>Phone fact stack</h3>
            <PlannerSummaryList
              ariaLabel="Phone package readiness facts"
              items={[
                {
                  id: "ready",
                  label: "Ready",
                  tone: "success",
                  value: "8"
                },
                {
                  id: "review",
                  label: "Review",
                  tone: "warning",
                  value: "2"
                },
                {
                  id: "blocked",
                  label: "Blocked",
                  tone: "critical",
                  value: "1"
                }
              ]}
              orientation="vertical"
              variant="compact"
            />
          </section>
        </PlannerResponsiveGrid>
      </PlannerContentSection>

      {readyDecisionRecommendation && blockedDecisionRecommendation ? (
        <PlannerContentSection
          badge={<PlannerStatusBadge tone="success">RU6</PlannerStatusBadge>}
          eyebrow="Component family"
          title="Decision action surfaces"
          titleId="showcase-decision-actions"
          variant="surface"
        >
          <PlannerResponsiveGrid>
            <PlannerDecisionPanel
              actions={buildShowcaseDecisionActions(readyDecisionRecommendation)}
              blockers={buildShowcaseDecisionBlockers(readyDecisionRecommendation)}
              facts={buildShowcaseDecisionFacts(readyDecisionRecommendation)}
              packageId={readyDecisionRecommendation.packageId}
              packageNumber={readyDecisionRecommendation.packageNumber}
              planningRunId={recommendationSet.planningRunId}
              recordAction="/ui-library"
              secondaryAction={<RadixLink href="/recommendations">Back to queue</RadixLink>}
              title="Ready package decision"
              titleId="showcase-ready-decision"
              workOrderIds={readyDecisionRecommendation.workOrders.map((workOrder) => workOrder.id)}
            />
            <PlannerDecisionPanel
              actions={buildShowcaseDecisionActions(blockedDecisionRecommendation)}
              blockers={buildShowcaseDecisionBlockers(blockedDecisionRecommendation)}
              facts={buildShowcaseDecisionFacts(blockedDecisionRecommendation)}
              packageId={blockedDecisionRecommendation.packageId}
              packageNumber={blockedDecisionRecommendation.packageNumber}
              planningRunId={recommendationSet.planningRunId}
              recordAction="/ui-library"
              secondaryAction={<RadixLink href="/work-order-backlog">Review work orders</RadixLink>}
              title="Blocked package decision"
              titleId="showcase-blocked-decision"
              workOrderIds={blockedDecisionRecommendation.workOrders.map((workOrder) => workOrder.id)}
            />
          </PlannerResponsiveGrid>
        </PlannerContentSection>
      ) : null}

      <PlannerContentSection
        badge={<PlannerStatusBadge tone="warning">Scrollable on small screens</PlannerStatusBadge>}
        eyebrow="Component family"
        title="Tables and row states"
        titleId="showcase-tables"
        variant="surface"
      >
        <PlannerDataTable
          caption="UI showcase work-order rows"
          columns={workOrderColumns}
          getRowKey={(item) => item.id}
          rows={backlog.items}
        />
        <PlannerFilterToolbar
          ariaLabel="Showcase table controls"
          clearAction={{
            disabled: true,
            label: "Reset controls"
          }}
          filters={[
            {
              ariaLabel: "Showcase work-order filters",
              kind: "links",
              options: [
                {
                  href: "/ui-library",
                  label: `All (${backlog.items.length})`,
                  selected: true
                },
                {
                  href: "/ui-library?filter=ready",
                  label: "Ready"
                },
                {
                  href: "/ui-library?filter=exceptions",
                  label: "Exceptions"
                }
              ]
            }
          ]}
          resultSummary={`Showing ${Math.min(4, backlog.items.length)} of ${backlog.items.length} rows`}
          search={{
            id: "showcase-table-search",
            label: "Search work orders",
            placeholder: "Search work order, package or issue",
            readOnly: true,
            value: "pump"
          }}
        />
        <PlannerDataTable
          caption="UI showcase controlled work-order table"
          columns={controlledWorkOrderColumns}
          density="compact"
          getRowKey={(item) => item.id}
          rows={backlog.items.slice(0, 4)}
          sortState={{
            columnKey: "due",
            direction: "ascending"
          }}
        />
        <PlannerPagination
          currentPage={1}
          hrefForPage={(page) => `/ui-library?page=${page}`}
          pageSize={4}
          totalItems={backlog.items.length}
        />
        <PlannerDataTable
          caption="UI showcase empty table"
          columns={workOrderColumns}
          emptyState={
            <PlannerEmptyState
              description="The table shell stays stable when a filtered synthetic review state has no rows."
              title="No matching rows"
            />
          }
          getRowKey={(item) => item.id}
          rows={[]}
        />
        <PlannerDataTable
          caption="UI showcase compact operations signals"
          columns={signalColumns}
          density="compact"
          getRowKey={(signal) => signal.label}
          rows={posture.signals}
        />
        <PlannerDataTable
          caption="UI showcase horizontally overflowing work-order rows"
          columns={overflowingWorkOrderColumns}
          getRowKey={(item) => item.id}
          rows={backlog.items}
        />
      </PlannerContentSection>

      <PlannerContentSection
        badge={<PlannerStatusBadge tone="info">Live-region checks</PlannerStatusBadge>}
        eyebrow="Component family"
        title="Empty, loading and error states"
        titleId="showcase-states"
        variant="surface"
      >
        <PlannerResponsiveGrid>
          <PlannerEmptyState
            description="No synthetic package matches this reviewer filter."
            title="No package selected"
          />
          <PlannerContentSection variant="surface">
            <PlannerLoadingState label="Loading planner review data" skeletonRows={3} />
          </PlannerContentSection>
          <PlannerEmptyState
            description="The service boundary returned a configuration issue for this local review."
            role="alert"
            title="Review state unavailable"
            tone="critical"
          />
        </PlannerResponsiveGrid>
      </PlannerContentSection>

      {recommendationSet.recommendations.length > 0 ? (
        <PlannerContentSection
          badge={
            <PlannerStatusBadge tone={toneForStatus(recommendationSet.status)}>
              {recommendationSet.status}
            </PlannerStatusBadge>
          }
          eyebrow="Component family"
          title="Recommendation cards"
          titleId="showcase-recommendations"
          variant="surface"
        >
          <PlannerResponsiveGrid ariaLabel="Showcase recommendation cards">
            {recommendationSet.recommendations.map((recommendation) => (
              <ShowcaseRecommendationCard
                key={recommendation.packageId}
                recommendation={recommendation}
              />
            ))}
          </PlannerResponsiveGrid>
        </PlannerContentSection>
      ) : null}

      <PlannerContentSection
        badge={
          <PlannerStatusBadge tone={toneForPostureState(posture.state)}>
            {posture.state}
          </PlannerStatusBadge>
        }
        eyebrow="Component family"
        title="Operations posture summaries"
        titleId="showcase-posture"
        variant="surface"
      >
        <PlannerMetricSummary
          ariaLabel="Showcase operations posture summary"
          items={buildOperationsMetrics(posture, sourceReadiness, scenarioSummary.latest)}
        />
        <PlannerDataTable
          caption="UI showcase operations posture signals"
          columns={signalColumns}
          getRowKey={(signal) => signal.label}
          rows={posture.signals}
        />
      </PlannerContentSection>
    </PlannerPage>
  );
}

function buildShowcaseDecisionActions(recommendation: PlannerRecommendation) {
  const readyForAcceptance = isReadyRecommendation(recommendation);

  return plannerDecisionActions.map((action) =>
    action.decision === "Accepted"
      ? {
          ...action,
          disabled: !readyForAcceptance,
          disabledDescription: "Resolve blockers before accepting."
        }
      : action
  );
}

function buildShowcaseDecisionBlockers(recommendation: PlannerRecommendation) {
  return recommendation.blockers.map((blocker, index) => ({
    id: `${blocker.code}-${index}`,
    label: blocker.code,
    summary: blocker.summary
  }));
}

function buildShowcaseDecisionFacts(recommendation: PlannerRecommendation) {
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

function ShowcaseRecommendationCard({
  recommendation
}: {
  readonly recommendation: PlannerRecommendation;
}) {
  const titleId = `${recommendation.packageId}-showcase-card`;

  return (
    <PlannerContentSection
      as="article"
      badge={
        <PlannerBadgeGroup align="end">
          <PlannerStatusBadge tone={toneForStatus(recommendation.status)}>
            {recommendation.status}
          </PlannerStatusBadge>
          <PlannerStatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
            {recommendation.sourceDataReadiness.status}
          </PlannerStatusBadge>
        </PlannerBadgeGroup>
      }
      description={recommendation.title}
      eyebrow="Synthetic package recommendation"
      title={recommendation.packageNumber}
      titleId={titleId}
      variant="surface"
    >

      <PlannerResponsiveGrid balance="secondary">
        <PlannerContentSection
          title="Explanation"
          titleId={`${titleId}-explanation`}
        >
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
                value: recommendation.actionability
              },
              {
                id: "estimated-work",
                label: "Estimated work",
                value: formatHours(recommendation.estimatedHours)
              }
            ]}
          />
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
          summaryAriaLabel={`${recommendation.packageNumber} readiness facts`}
          title="Readiness"
          titleId={`${recommendation.packageId}-showcase-readiness`}
        />
      </PlannerResponsiveGrid>

      <PlannerAlert
        title={recommendation.blockers.length > 0 ? "Package blockers" : "No package blockers"}
        tone={recommendation.blockers.length > 0 ? "warning" : "success"}
      >
        {recommendation.blockers.length > 0 ? (
          <PlannerPlainList>
            {recommendation.blockers.map((blocker) => (
              <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}`}>
                <strong>{blocker.code}</strong>: {blocker.summary}
              </li>
            ))}
          </PlannerPlainList>
        ) : (
          <p>Service-owned constraints do not show a blocker for this package group.</p>
        )}
      </PlannerAlert>
    </PlannerContentSection>
  );
}
