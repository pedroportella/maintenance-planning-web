import type { collectStructuralAccessibilityScan } from "../ui-library-accessibility/structural-scan";
import type { collectKeyboardFocusReport } from "../ui-library-accessibility/focus-report";
import type { PlannerRouteAccessibilityFixture } from "./route-fixtures";

export type PlannerRouteAccessibilityRouteEvidence = {
  form?: string;
  heading: string;
  keyboardFocus: Awaited<ReturnType<typeof collectKeyboardFocusReport>>;
  path: string;
  scan: Awaited<ReturnType<typeof collectStructuralAccessibilityScan>>;
  snapshotExcerpt: string;
  table?: string;
};

export function createPlannerRouteAccessibilityEvidence() {
  return {
    automatedBrowserSmoke: {
      checks: [
        "landmarks and page headings",
        "route table names, regions and row headers",
        "decision-form names and keyboard-style radio activation",
        "unlabelled control and positive tabindex scan",
        "label-in-name scan for visible command targets",
        "Chromium accessibility-tree snapshots"
      ],
      engine: "Playwright Chromium",
      mode: "deterministic mock services",
      routes: [] as PlannerRouteAccessibilityRouteEvidence[]
    },
    manualAssistiveTechnologyEvidence: [
      {
        check: "VoiceOver desktop screen-reader smoke",
        reason: "This automated environment cannot perform a human screen-reader pass.",
        status: "not performed"
      },
      {
        check: "Mobile screen-reader smoke",
        reason: "No physical or simulator mobile assistive-technology session is available here.",
        status: "not performed"
      },
      {
        check: "NVDA screen-reader smoke",
        reason: "No Windows review machine is available in this environment.",
        status: "not performed"
      },
      {
        check: "Speech-input command smoke",
        reason:
          "No speech-recognition session is available here; label-in-name is checked automatically.",
        status: "not performed"
      }
    ]
  };
}

export function createRouteEvidenceEntry({
  fixture,
  keyboardFocus,
  scan,
  snapshot
}: {
  fixture: PlannerRouteAccessibilityFixture;
  keyboardFocus: Awaited<ReturnType<typeof collectKeyboardFocusReport>>;
  scan: Awaited<ReturnType<typeof collectStructuralAccessibilityScan>>;
  snapshot: string;
}): PlannerRouteAccessibilityRouteEvidence {
  return {
    form: fixture.form,
    heading: fixture.heading,
    keyboardFocus,
    path: fixture.path,
    scan,
    snapshotExcerpt: trimAccessibilitySnapshot(snapshot),
    table: fixture.table
  };
}

export function trimAccessibilitySnapshot(snapshot: string, maxLength = 4_000) {
  return snapshot.replace(/\s+$/g, "").slice(0, maxLength);
}
