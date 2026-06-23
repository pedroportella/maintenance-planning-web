import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerAppLayout, type PlannerAppLayoutProps } from "./PlannerAppLayout";

describe("PlannerAppLayout", () => {
  it("renders the shell frame with skip link, content target and active navigation", () => {
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

    expect(markup).toContain("planner-app-layout");
    expect(markup).toContain('href="#planner-main"');
    expect(markup).toContain('id="planner-main"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Planning runs");
  });

  it("renders focus mode without persistent side navigation", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerAppLayout, {
        brand: {
          ariaLabel: "Planner home",
          href: "/",
          name: "Planner Workbench"
        },
        children: createElement("main", null, "Decision task"),
        focusMode: true,
        navAriaLabel: "Planner sections",
        navItems: []
      })
    );

    expect(markup).toContain('data-focus-mode="true"');
    expect(markup).not.toContain("planner-app-layout-sidebar");
    expect(markup).not.toContain("planner-app-layout-menu-button");
  });
});
