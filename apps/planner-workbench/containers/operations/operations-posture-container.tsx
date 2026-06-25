import {
  PlannerActionGroup,
  PlannerActionLink,
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerDataTable,
  PlannerEmptyState,
  PlannerMetadataPanel,
  PlannerMetricSummary,
  PlannerPage,
  PlannerPageHeader,
  PlannerQuietNote,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  PlannerTableCellStack,
  type PlannerDataTableColumn
} from "@maintenance-planning/ui-library";
import {
  createPlannerServices,
  type LatestImportView,
  type OperationsSignalView
} from "@maintenance-planning/services";
import { getWorkbenchSection } from "@maintenance-planning/utils";
import Link from "next/link";
import { PlannerRouteFailure } from "@/components/planner-route-state";
import {
  buildOperationsMetrics,
  formatUtc,
  toneForFreshness,
  toneForPostureState
} from "@/lib/planner-format";

const signalColumns: readonly PlannerDataTableColumn<OperationsSignalView>[] = [
  {
    header: "Signal",
    key: "signal",
    render: (signal) => (
      <PlannerTableCellStack detail={signal.summary} title={signal.label} />
    ),
    rowHeader: true
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

export default async function OperationsPosturePage() {
  const section = getWorkbenchSection("operations-posture");

  try {
    const services = createPlannerServices();
    const runtime = services.getRuntimeInfo();
    const [posture, sourceReadiness, scenarioSummary] = await Promise.all([
      services.getOperationsPosture(),
      services.getSourceDataReadiness(),
      services.getScenarioOutcomeSummary()
    ]);
    const latestOutcome = scenarioSummary.latest;

    return (
      <PlannerPage>
        <PlannerPageHeader
          actions={
            <PlannerActionGroup>
              <PlannerActionLink asChild>
                <Link href="/scenario-outcomes">Open scenario outcomes</Link>
              </PlannerActionLink>
              <PlannerActionLink asChild priority="secondary">
                <Link href={`/planning-runs/${latestOutcome.planningRunId}`}>
                  Open latest run
                </Link>
              </PlannerActionLink>
            </PlannerActionGroup>
          }
          badge={
            <PlannerBadgeGroup align="end">
              <PlannerStatusBadge tone={toneForPostureState(posture.state)}>
                {posture.state}
              </PlannerStatusBadge>
              <PlannerStatusBadge tone="neutral">{runtime.mode} mode</PlannerStatusBadge>
            </PlannerBadgeGroup>
          }
          description="Scan import freshness, source-data readiness and latest scenario evidence for the synthetic planner review state."
          title={section.label}
        />

        <PlannerMetricSummary
          ariaLabel="Operations posture summary"
          items={buildOperationsMetrics(posture, sourceReadiness, latestOutcome)}
          variant="compact"
        />

        {posture.state === "healthy" ? (
          <PlannerQuietNote title="Operations review scope">{posture.summary}</PlannerQuietNote>
        ) : (
          <PlannerAlert title="Operations review scope" tone={toneForPostureState(posture.state)}>
            <p>{posture.summary}</p>
          </PlannerAlert>
        )}

        <PlannerResponsiveGrid
          ariaLabel="Operations posture details"
          as="section"
          balance="primary"
        >
          <PlannerContentSection
            badge={
              <PlannerStatusBadge tone={toneForFreshness(posture.freshness)}>
                {posture.freshness}
              </PlannerStatusBadge>
            }
            eyebrow="Planner-visible signals"
            title="Posture signals"
            titleId="posture-signals"
            variant="surface"
          >
            <PlannerDataTable
              caption="Operations posture signals"
              columns={signalColumns}
              density="compact"
              description="Use the signal row header, state, detail and checked columns to review planner-visible operations posture."
              getRowKey={(signal) => signal.label}
              rows={posture.signals}
            />
          </PlannerContentSection>

          <PlannerContentSection
            badge={
              <PlannerStatusBadge tone={toneForFreshness(posture.freshness)}>
                {posture.freshness}
              </PlannerStatusBadge>
            }
            eyebrow="Latest synthetic import"
            title="Import freshness"
            titleId="latest-import"
            variant="surface"
          >
            <LatestImportDetails latestImport={posture.latestImport} />
          </PlannerContentSection>
        </PlannerResponsiveGrid>

        <PlannerQuietNote title={`Latest scenario: ${latestOutcome.label}`}>
          <p>{latestOutcome.summary}</p>
          <p>
            {latestOutcome.runNumber}: {latestOutcome.readyPackageCount} ready,{" "}
            {latestOutcome.blockedPackageCount} blocked, checked{" "}
            {formatUtc(latestOutcome.checkedAtUtc)}.
          </p>
        </PlannerQuietNote>
      </PlannerPage>
    );
  } catch (error) {
    return (
      <PlannerRouteFailure
        description="The operations posture route reads planner-visible health and freshness evidence through the service boundary."
        error={error}
        title={section.label}
      />
    );
  }
}

function LatestImportDetails({ latestImport }: { latestImport?: LatestImportView | null }) {
  if (!latestImport) {
    return (
      <PlannerEmptyState
        description="The service did not return a latest synthetic import summary for this review state."
        title="No latest import"
      />
    );
  }

  return (
    <PlannerMetadataPanel
      density="compact"
      items={[
        {
          id: "source",
          label: "Source",
          value: latestImport.sourceSystem
        },
        {
          id: "import-kind",
          label: "Import kind",
          value: latestImport.importKind
        },
        {
          id: "status",
          label: "Status",
          tone: latestImport.status === "accepted" ? "success" : "warning",
          value: latestImport.status
        },
        {
          id: "received",
          label: "Received",
          value: latestImport.receivedCount
        },
        {
          id: "accepted",
          label: "Accepted",
          tone: "success",
          value: latestImport.acceptedCount
        },
        {
          id: "rejected",
          label: "Rejected",
          tone: latestImport.rejectedCount > 0 ? "critical" : "neutral",
          value: latestImport.rejectedCount
        },
        {
          id: "stale",
          label: "Stale",
          tone: latestImport.ignoredStaleCount > 0 ? "warning" : "neutral",
          value: latestImport.ignoredStaleCount
        },
        {
          id: "completed",
          label: "Completed",
          value: formatUtc(latestImport.completedAtUtc)
        }
      ]}
      summaryAriaLabel="Latest import facts"
      title="Latest import facts"
      titleId="latest-import-facts"
    />
  );
}
