import {
  PlannerBadgeGroup,
  PlannerCheckbox,
  PlannerContentSection,
  PlannerRadioCards,
  PlannerRadioGroup,
  PlannerResponsiveGrid,
  PlannerSelect,
  PlannerTextArea,
  PlannerTextInput,
  RadixBadge,
  RadixButton,
  RadixCallout,
  RadixHeading,
  RadixIcon,
  RadixLink,
  RadixText
} from "@maintenance-planning/ui-library";

export function RadixAdaptersSection() {
  return (
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
  );
}
