import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerThemeProvider } from "../../theme/PlannerThemeProvider";
import { PlannerFilterToolbar } from "./PlannerFilterToolbar";

describe("PlannerFilterToolbar", () => {
  it("renders accessible search, select filters and result summary", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerThemeProvider, {
        children: createElement(PlannerFilterToolbar, {
          ariaLabel: "Planner table controls",
          clearAction: {
            disabled: false,
            label: "Reset"
          },
          filters: [
            {
              id: "readiness",
              kind: "select",
              label: "Readiness",
              options: [
                {
                  label: "All",
                  value: "all"
                },
                {
                  label: "Ready",
                  value: "ready"
                }
              ],
              value: "ready"
            }
          ],
          resultSummary: "Showing 3 of 12 rows",
          search: {
            id: "queue-search",
            label: "Search queue",
            placeholder: "Search work orders",
            value: "pump"
          }
        }),
        forcedAppearance: "light"
      })
    );

    expect(markup).toContain('aria-label="Planner table controls"');
    expect(markup).toContain('for="queue-search"');
    expect(markup).toContain('value="pump"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain("Showing 3 of 12 rows");
    expect(markup).toContain("Reset");
  });

  it("preserves URL-safe filter links and current state", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerFilterToolbar, {
        ariaLabel: "Route filters",
        filters: [
          {
            ariaLabel: "Work-order filters",
            kind: "links",
            options: [
              {
                href: "/work-order-backlog",
                label: "All"
              },
              {
                href: "/work-order-backlog?filter=ready",
                label: "Ready",
                selected: true
              }
            ]
          }
        ]
      })
    );

    expect(markup).toContain('href="/work-order-backlog?filter=ready"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("segmented-nav");
  });
});
