import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerAppLayout, type PlannerAppLayoutProps } from "./PlannerAppLayout";

describe("PlannerAppLayout", () => {
  it("renders the compatibility app shell with active navigation", () => {
    const props: PlannerAppLayoutProps = {
      activeHref: "/planning-runs",
      brand: {
        ariaLabel: "Planner home",
        href: "/",
        name: "Planner Workbench"
      },
      children: createElement("main", null, "Planning runs"),
      navAriaLabel: "Planner sections",
      navItems: [
        {
          href: "/planning-runs",
          label: "Planning runs"
        }
      ]
    };

    const markup = renderToStaticMarkup(createElement(PlannerAppLayout, props));

    expect(markup).toContain("app-shell");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Planning runs");
  });
});
