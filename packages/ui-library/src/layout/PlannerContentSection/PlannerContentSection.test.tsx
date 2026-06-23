import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerContentSection } from "./PlannerContentSection";

describe("PlannerContentSection", () => {
  it("renders an optional heading relationship and body", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerContentSection,
        {
          badge: createElement("span", null, "RU2"),
          children: createElement("p", null, "Template body"),
          description: "Reusable content section rhythm.",
          title: "Layout template section",
          titleId: "layout-section-title",
          variant: "surface"
        }
      )
    );

    expect(markup).toContain('aria-labelledby="layout-section-title"');
    expect(markup).toContain('data-variant="surface"');
    expect(markup).toContain("Template body");
    expect(markup).toContain("RU2");
  });
});
