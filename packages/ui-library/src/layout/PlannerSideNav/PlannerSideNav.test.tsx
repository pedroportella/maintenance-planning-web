import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerSideNav } from "./PlannerSideNav";

describe("PlannerSideNav", () => {
  it("renders active navigation links without router coupling", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSideNav, {
        activeHref: "/recommendations/PKG-100",
        ariaLabel: "Planner sections",
        items: [
          {
            href: "/recommendations",
            label: "Recommendations"
          }
        ]
      })
    );

    expect(markup).toContain("<nav");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/recommendations"');
  });
});
