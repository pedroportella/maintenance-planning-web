import type { Metadata } from "next";
import {
  Alert,
  DataTable,
  EmptyState,
  ErrorState,
  MetricSummary,
  PageHeader,
  PlannerAlert,
  PlannerCheckbox,
  PlannerAppLayout,
  PlannerContentSection,
  PlannerEmptyState,
  PlannerLoadingState,
  PlannerPage,
  PlannerPageHeader,
  PlannerQuietNote,
  PlannerRadioCards,
  PlannerRadioGroup,
  PlannerSelect,
  PlannerSideNav,
  PlannerStatusBadge,
  PlannerStatusPill,
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
  StatusBadge,
  WorkbenchPanel,
  type DataTableColumn,
  type Tone
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
  toneForPostureState,
  toneForReadiness,
  toneForStatus
} from "@/lib/planner-format";

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
  readonly tone: Tone;
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

const signalColumns: readonly DataTableColumn<OperationsSignalView>[] = [
  {
    header: "Signal",
    key: "signal",
    render: (signal) => (
      <span className="table-stack">
        <strong>{signal.label}</strong>
        <span>{signal.summary}</span>
      </span>
    )
  },
  {
    header: "State",
    key: "state",
    render: (signal) => (
      <StatusBadge tone={toneForPostureState(signal.status)}>{signal.status}</StatusBadge>
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

const workOrderColumns: readonly DataTableColumn<WorkOrderBacklogItem>[] = [
  {
    header: "Work order",
    key: "work-order",
    render: (item) => (
      <span className="table-stack">
        <strong>{item.workOrderNumber}</strong>
        <span>{item.title}</span>
      </span>
    )
  },
  {
    header: "Readiness",
    key: "readiness",
    render: (item) => (
      <StatusBadge tone={toneForReadiness(item.readinessStatus)}>
        {item.readinessStatus}
      </StatusBadge>
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

  return (
    <PlannerPage className="ui-library-page" id="ui-library-main" labelledBy="ui-library-title">
      <PageHeader
        badge={
          <span className="badge-stack">
            <StatusBadge tone="info">Reviewer evidence</StatusBadge>
            <StatusBadge tone="neutral">Static mock data</StatusBadge>
          </span>
        }
        description="Focused visual and accessibility evidence for reusable synthetic planner workbench states."
        eyebrow="Developer route"
        title="UI library showcase"
        titleId="ui-library-title"
      />

      <Alert title="Route scope" tone="info">
        <p>
          This page is an internal reviewer and developer aid. It uses checked synthetic fixtures
          and does not call a backend service.
        </p>
      </Alert>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-theme-foundation">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Theme foundation</p>
            <h2 id="showcase-theme-foundation">Light, dark and system modes</h2>
          </div>
          <StatusBadge tone="success">Radix theme provider</StatusBadge>
        </div>
        <div className="showcase-tone-grid" aria-label="Theme mode evidence">
          <Alert className="light" title="Light mode" tone="neutral">
            <p>Uses the planner light palette from shared tokens.</p>
          </Alert>
          <Alert className="dark" title="Dark mode" tone="neutral">
            <p>Uses the planner dark palette from shared tokens.</p>
          </Alert>
          <Alert title="System mode" tone="neutral">
            <p>Inherits the active document mode from the root theme provider.</p>
          </Alert>
        </div>
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-radix-adapters">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Adapter family</p>
            <h2 id="showcase-radix-adapters">Radix fidelity adapters</h2>
          </div>
          <RadixBadge tone="success">RU1</RadixBadge>
        </div>
        <div className="showcase-tone-grid">
          <section aria-label="Radix typography and actions">
            <RadixHeading as="h3">Adapter primitives</RadixHeading>
            <RadixText as="p" tone="muted">
              Foundational controls render through the local ui-library boundary.
            </RadixText>
            <div className="showcase-badge-row">
              <RadixButton>
                <RadixIcon name="check" />
                Apply
              </RadixButton>
              <RadixButton disabled tone="neutral" variant="soft">
                Disabled
              </RadixButton>
              <RadixLink href="#showcase-radix-adapters">Anchor link</RadixLink>
            </div>
          </section>
          <RadixCallout title="Form semantics" tone="info">
            Labels, hints, errors and described-by wiring are centralised in the adapter layer.
          </RadixCallout>
        </div>
        <div className="showcase-tone-grid">
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
        </div>
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
      </WorkbenchPanel>

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

        <div className="showcase-tone-grid">
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
        </div>
      </PlannerContentSection>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-alerts">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-alerts">Alerts and badges</h2>
          </div>
          <StatusBadge tone="neutral">All tones</StatusBadge>
        </div>
        <div className="showcase-tone-grid">
          {toneExamples.map((example) => (
            <PlannerAlert key={example.tone} title={`${example.label} alert`} tone={example.tone}>
              <p>{example.detail}</p>
            </PlannerAlert>
          ))}
          <PlannerQuietNote title="Quiet note">
            Secondary review context stays visible without announcing as an alert.
          </PlannerQuietNote>
        </div>
        <section aria-label="Status badge tone examples" className="showcase-badge-row">
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
        </section>
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-tables">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-tables">Tables and row states</h2>
          </div>
          <StatusBadge tone="warning">Scrollable on small screens</StatusBadge>
        </div>
        <DataTable
          caption="UI showcase work-order rows"
          columns={workOrderColumns}
          getRowKey={(item) => item.id}
          rows={backlog.items}
        />
        <DataTable
          caption="UI showcase empty table"
          columns={workOrderColumns}
          emptyState={
            <EmptyState
              description="The table shell stays stable when a filtered synthetic review state has no rows."
              title="No matching rows"
            />
          }
          getRowKey={(item) => item.id}
          rows={[]}
        />
      </WorkbenchPanel>

      <WorkbenchPanel className="console-panel" labelledBy="showcase-states">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-states">Empty, loading and error states</h2>
          </div>
          <StatusBadge tone="info">Live-region checks</StatusBadge>
        </div>
        <div className="showcase-state-grid">
          <PlannerEmptyState
            description="No synthetic package matches this reviewer filter."
            title="No package selected"
          />
          <div className="showcase-loading-state">
            <PlannerLoadingState label="Loading planner review data" skeletonRows={3} />
          </div>
          <ErrorState
            description="The service boundary returned a configuration issue for this local review."
            title="Review state unavailable"
          />
        </div>
      </WorkbenchPanel>

      {recommendationSet.recommendations.length > 0 ? (
        <WorkbenchPanel className="console-panel" labelledBy="showcase-recommendations">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Component family</p>
              <h2 id="showcase-recommendations">Recommendation cards</h2>
            </div>
            <StatusBadge tone={toneForStatus(recommendationSet.status)}>
              {recommendationSet.status}
            </StatusBadge>
          </div>
          <section className="recommendation-list" aria-label="Showcase recommendation cards">
            {recommendationSet.recommendations.map((recommendation) => (
              <ShowcaseRecommendationCard
                key={recommendation.packageId}
                recommendation={recommendation}
              />
            ))}
          </section>
        </WorkbenchPanel>
      ) : null}

      <WorkbenchPanel className="console-panel" labelledBy="showcase-posture">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Component family</p>
            <h2 id="showcase-posture">Operations posture summaries</h2>
          </div>
          <StatusBadge tone={toneForPostureState(posture.state)}>{posture.state}</StatusBadge>
        </div>
        <MetricSummary
          ariaLabel="Showcase operations posture summary"
          items={buildOperationsMetrics(posture, sourceReadiness, scenarioSummary.latest)}
        />
        <DataTable
          caption="UI showcase operations posture signals"
          columns={signalColumns}
          getRowKey={(signal) => signal.label}
          rows={posture.signals}
        />
      </WorkbenchPanel>
    </PlannerPage>
  );
}

function ShowcaseRecommendationCard({
  recommendation
}: {
  readonly recommendation: PlannerRecommendation;
}) {
  return (
    <article aria-label={recommendation.packageNumber} className="recommendation-card">
      <div className="recommendation-card-header">
        <div>
          <p className="eyebrow">Synthetic package recommendation</p>
          <h3>{recommendation.packageNumber}</h3>
          <p>{recommendation.title}</p>
        </div>
        <span className="badge-stack">
          <StatusBadge tone={toneForStatus(recommendation.status)}>
            {recommendation.status}
          </StatusBadge>
          <StatusBadge tone={toneForReadiness(recommendation.sourceDataReadiness.status)}>
            {recommendation.sourceDataReadiness.status}
          </StatusBadge>
        </span>
      </div>

      <div className="recommendation-grid">
        <section aria-label={`${recommendation.packageNumber} explanation`}>
          <h3>Explanation</h3>
          <p>{recommendation.explanation.text}</p>
          <dl className="detail-list">
            <div>
              <dt>Score</dt>
              <dd>{recommendation.score}</dd>
            </div>
            <div>
              <dt>Actionability</dt>
              <dd>{recommendation.actionability}</dd>
            </div>
            <div>
              <dt>Estimated work</dt>
              <dd>{formatHours(recommendation.estimatedHours)}</dd>
            </div>
          </dl>
        </section>

        <section aria-label={`${recommendation.packageNumber} readiness`}>
          <h3>Readiness</h3>
          <p>{recommendation.sourceDataReadiness.summary}</p>
          <dl className="detail-list detail-list-compact">
            <div>
              <dt>Ready</dt>
              <dd>{recommendation.sourceDataReadiness.readyCount}</dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>{recommendation.sourceDataReadiness.needsReviewCount}</dd>
            </div>
            <div>
              <dt>Blocked</dt>
              <dd>{recommendation.sourceDataReadiness.blockedCount}</dd>
            </div>
          </dl>
        </section>
      </div>

      <Alert
        title={recommendation.blockers.length > 0 ? "Package blockers" : "No package blockers"}
        tone={recommendation.blockers.length > 0 ? "warning" : "success"}
      >
        {recommendation.blockers.length > 0 ? (
          <ul className="plain-list">
            {recommendation.blockers.map((blocker) => (
              <li key={`${blocker.code}-${blocker.workOrderNumbers.join("-")}`}>
                <strong>{blocker.code}</strong>: {blocker.summary}
              </li>
            ))}
          </ul>
        ) : (
          <p>Service-owned constraints do not show a blocker for this package group.</p>
        )}
      </Alert>
    </article>
  );
}
