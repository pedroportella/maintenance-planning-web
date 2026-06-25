import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerAlert,
  PlannerAppLayout,
  PlannerDataTable,
  PlannerEmptyState,
  PlannerLoadingState,
  PlannerPageHeader,
  PlannerQuietNote,
  PlannerSegmentedNav,
  PlannerStatusBadge,
  type PlannerAppLayoutNavItem,
  type PlannerDataTableColumn
} from "../src";

const themeScss = readFileSync(new URL("../src/theme/theme.scss", import.meta.url), "utf8");
const sideNavScss = readFileSync(
  new URL("../src/components/layout/PlannerSideNav/PlannerSideNav.scss", import.meta.url),
  "utf8"
);

describe("ui-library components", () => {
  it("renders an accessible planner app layout with active navigation", () => {
    const navItems: PlannerAppLayoutNavItem[] = [
      {
        description: "Items needing review",
        group: "Review",
        href: "/work-order-backlog",
        label: "Work-order backlog"
      },
      {
        description: "Decision queue",
        group: "Review",
        href: "/recommendations",
        label: "Recommendations"
      }
    ];

    const markup = renderToStaticMarkup(
      createElement(PlannerAppLayout, {
        activeHref: "/recommendations",
        brand: {
          ariaLabel: "Planner workbench home",
          href: "/",
          name: "Planner Workbench",
          tagline: "Synthetic planning review"
        },
        children: createElement("main", null, "Queue"),
        navAriaLabel: "Planner sections",
        navItems,
        sidebarNote: "Synthetic local review only."
      })
    );

    expect(markup).toContain(
      'aria-label="Planner Workbench - Synthetic planning review - Planner workbench home"'
    );
    expect(markup).toContain('aria-label="Planner sections"');
    expect(markup).toContain('href="#planner-main"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("planner-side-nav-heading");
    expect(markup).toContain("Recommendations");
  });

  it("renders headers, status badges and alert roles", () => {
    const markup = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(PlannerPageHeader, {
          badge: createElement(PlannerStatusBadge, { children: "Static mock shell", tone: "info" }),
          description: "Synthetic route review.",
          title: "Planner Workbench"
        }),
        createElement(PlannerAlert, {
          children: "Missing detail",
          title: "Needs review",
          tone: "warning"
        }),
        createElement(PlannerQuietNote, {
          children: "Synthetic local review only.",
          title: "Scope"
        })
      )
    );

    expect(markup).toContain("<h1>Planner Workbench</h1>");
    expect(markup).toContain("planner-status-badge-info");
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("planner-quiet-note");
  });

  it("renders data tables with captions and empty states", () => {
    type Row = {
      status: string;
      workOrder: string;
    };

    const columns: Array<PlannerDataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder
      },
      {
        header: "Status",
        key: "status",
        render: (row) => createElement(PlannerStatusBadge, { children: row.status, tone: "success" })
      }
    ];

    const populated = renderToStaticMarkup(
      createElement(PlannerDataTable<Row>, {
        caption: "Package recommendation queue",
        columns,
        getRowKey: (row) => row.workOrder,
        rows: [
          {
            status: "Ready",
            workOrder: "WO-1000"
          }
        ]
      })
    );
    const empty = renderToStaticMarkup(
      createElement(PlannerDataTable<Row>, {
        caption: "Empty queue",
        columns,
        getRowKey: (row) => row.workOrder,
        rows: []
      })
    );

    expect(populated).toContain("Package recommendation queue");
    expect(populated).toContain("<th");
    expect(populated).toContain("WO-1000");
    expect(empty).toContain("No rows to show");
  });

  it("uses keyboard-reachable segmented links and focus-visible styles", () => {
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

    expect(markup).toContain('href="#queue"');
    expect(markup).toContain('aria-current="page"');
    expect(themeScss).toContain("../components/layout/PlannerSideNav/PlannerSideNav");
    expect(themeScss).toContain("../components/data/PlannerSegmentedNav/PlannerSegmentedNav");
    expect(themeScss).not.toContain("../layout/");
    expect(themeScss).not.toContain("../data/");
    expect(sideNavScss).toContain(".planner-side-nav-link:focus-visible");
  });

  it("publishes loading and error states with live-region roles", () => {
    const markup = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(PlannerLoadingState, { label: "Loading queue" }),
        createElement(PlannerEmptyState, {
          description: "The local shell could not render.",
          role: "alert",
          title: "Queue unavailable",
          tone: "critical"
        })
      )
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("rt-Spinner");
  });
});
