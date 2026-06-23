import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerPageHeader } from "./PlannerPageHeader";

describe("PlannerPageHeader", () => {
  it("renders page title, description, badge and actions", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerPageHeader, {
        actions: createElement("a", { href: "/recommendations" }, "Open queue"),
        badge: createElement("span", null, "Reviewer evidence"),
        description: "Synthetic route review.",
        eyebrow: "Developer route",
        title: "UI library showcase",
        titleId: "showcase-title"
      })
    );

    expect(markup).toContain('class="planner-page-header"');
    expect(markup).toContain('id="showcase-title"');
    expect(markup).toContain("Reviewer evidence");
    expect(markup).toContain("Open queue");
  });
});
