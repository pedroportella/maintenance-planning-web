import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerActionGroup, PlannerActionLink } from "./PlannerActionGroup";

describe("PlannerActionGroup", () => {
  it("renders responsive route actions with primary and secondary priorities", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerActionGroup,
        {
          align: "start",
          children: [
            createElement(
              PlannerActionLink,
              {
                asChild: true,
                children: createElement("a", { href: "/recommendations" }, "Review"),
                key: "recommendations"
              }
            ),
            createElement(PlannerActionLink, {
              asChild: true,
              children: createElement("a", { href: "/planning-runs" }, "Planning runs"),
              key: "planning-runs",
              priority: "secondary"
            })
          ]
        }
      )
    );

    expect(markup).toContain("planner-action-group");
    expect(markup).toContain('data-align="start"');
    expect(markup).toContain('data-priority="primary"');
    expect(markup).toContain('data-priority="secondary"');
    expect(markup).toContain('href="/recommendations"');
  });
});
