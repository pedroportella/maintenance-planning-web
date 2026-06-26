import {
  PlannerAlert,
  PlannerBadgeGroup,
  PlannerContentSection,
  PlannerQuietNote,
  PlannerResponsiveGrid,
  PlannerStatusBadge,
  PlannerStatusPill
} from "@maintenance-planning/ui-library";
import { toneExamples } from "./showcase-fixtures";

export function AlertsBadgesSection() {
  return (
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
  );
}
