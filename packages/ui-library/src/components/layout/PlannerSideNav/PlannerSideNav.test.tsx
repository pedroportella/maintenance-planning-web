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
            group: "Review",
            href: "/recommendations",
            label: "Recommendations"
          }
        ]
      })
    );

    expect(markup).toContain("<nav");
    expect(markup).toContain("Review");
    expect(markup).toContain("planner-side-nav-list");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/recommendations"');
  });

  it("keeps the home link active only on the exact root route", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSideNav, {
        activeHref: "/recommendations",
        ariaLabel: "Planner sections",
        items: [
          {
            href: "/",
            label: "Home"
          },
          {
            href: "/recommendations",
            label: "Recommendations"
          }
        ]
      })
    );

    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });
});
