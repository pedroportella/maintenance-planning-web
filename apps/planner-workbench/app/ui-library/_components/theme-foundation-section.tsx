import {
  PlannerAlert,
  PlannerContentSection,
  PlannerResponsiveGrid,
  PlannerStatusBadge
} from "@maintenance-planning/ui-library";
import styles from "../page.module.scss";

export function ThemeFoundationSection() {
  return (
    <PlannerContentSection
      badge={<PlannerStatusBadge tone="success">Radix theme provider</PlannerStatusBadge>}
      eyebrow="Theme foundation"
      title="Light, dark and system modes"
      titleId="showcase-theme-foundation"
      variant="surface"
    >
      <PlannerResponsiveGrid ariaLabel="Theme mode evidence" className={styles.themeGrid}>
        <ThemeModeEvidence
          appearance="light"
          description="Uses the planner light palette from shared tokens."
          title="Light mode"
        />
        <ThemeModeEvidence
          appearance="dark"
          description="Uses the planner dark palette from shared tokens."
          title="Dark mode"
        />
        <ThemeModeEvidence
          description="Inherits the active document mode from the root theme provider."
          title="System mode"
        />
      </PlannerResponsiveGrid>
    </PlannerContentSection>
  );
}

function ThemeModeEvidence({
  appearance,
  description,
  title
}: {
  readonly appearance?: "dark" | "light";
  readonly description: string;
  readonly title: string;
}) {
  return (
    <article
      aria-label={`${title} evidence`}
      className={
        appearance
          ? `${appearance} ${styles.themeSampleSurface}`
          : styles.themeSampleSurface
      }
    >
      <PlannerAlert title={title} tone="neutral">
        <p>{description}</p>
      </PlannerAlert>
    </article>
  );
}
