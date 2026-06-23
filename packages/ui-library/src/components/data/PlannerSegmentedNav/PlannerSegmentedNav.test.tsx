import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerSegmentedNav } from "./PlannerSegmentedNav";

describe("PlannerSegmentedNav", () => {
  it("renders URL-safe links with current page state", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSegmentedNav, {
        ariaLabel: "Workbench page sections",
        options: [
          {
            href: "#queue",
            label: "Queue",
            selected: true
          },
          {
            href: "#route-map",
            label: "Route map"
          }
        ]
      })
    );

    expect(markup).toContain('aria-label="Workbench page sections"');
    expect(markup).toContain('href="#queue"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("planner-segmented-nav");
  });
});
