import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerSubmitButton } from "./PlannerSubmitButton";

describe("PlannerSubmitButton", () => {
  it("renders a native submit button with idle children", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSubmitButton, {
        children: "Save decision",
        tone: "success"
      })
    );

    expect(markup).toContain('type="submit"');
    expect(markup).toContain("planner-submit-button");
    expect(markup).toContain("Save decision");
    expect(markup).not.toContain("planner-submit-button-spinner");
    expect(markup).not.toContain("Submitting...");
  });

  it("shows pending children, spinner and disabled state while submitting", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSubmitButton, {
        "aria-describedby": "submit-status",
        children: "Accept package",
        pending: true,
        pendingChildren: "Recording decision...",
        tone: "success"
      })
    );

    expect(markup).toContain("Recording decision...");
    expect(markup).toContain("planner-submit-button-spinner");
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('aria-describedby="submit-status"');
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("Accept package");
  });
});
