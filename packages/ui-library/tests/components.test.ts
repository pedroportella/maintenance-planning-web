import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Alert,
  AppShell,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  QuietNote,
  SegmentedNav,
  StatusBadge,
  type AppShellNavItem,
  type DataTableColumn
} from "../src";

const themeScss = readFileSync(new URL("../src/theme/theme.scss", import.meta.url), "utf8");
const sideNavScss = readFileSync(
  new URL("../src/layout/PlannerSideNav/PlannerSideNav.scss", import.meta.url),
  "utf8"
);

describe("ui-library components", () => {
  it("renders an accessible app shell with active navigation", () => {
    const navItems: AppShellNavItem[] = [
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
      createElement(AppShell, {
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

    expect(markup).toContain('aria-label="Planner workbench home"');
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
        createElement(PageHeader, {
          badge: createElement(StatusBadge, { children: "Static mock shell", tone: "info" }),
          description: "Synthetic route review.",
          title: "Planner Workbench"
        }),
        createElement(Alert, { children: "Missing detail", title: "Needs review", tone: "warning" }),
        createElement(QuietNote, { children: "Synthetic local review only.", title: "Scope" })
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

    const columns: Array<DataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder
      },
      {
        header: "Status",
        key: "status",
        render: (row) => createElement(StatusBadge, { children: row.status, tone: "success" })
      }
    ];

    const populated = renderToStaticMarkup(
      createElement(DataTable<Row>, {
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
      createElement(DataTable<Row>, {
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

  it("uses keyboard-reachable links and focus-visible styles", () => {
    const markup = renderToStaticMarkup(
      createElement(SegmentedNav, {
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
    expect(themeScss).toContain("../layout/PlannerSideNav/PlannerSideNav");
    expect(sideNavScss).toContain(".planner-side-nav-link:focus-visible");
    expect(themeScss).toContain("../components/segmented-nav/segmented-nav");
  });

  it("publishes loading and error states with live-region roles", () => {
    const markup = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(LoadingState, { label: "Loading queue" }),
        createElement(ErrorState, {
          description: "The local shell could not render.",
          title: "Queue unavailable"
        })
      )
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("rt-Spinner");
  });
});
