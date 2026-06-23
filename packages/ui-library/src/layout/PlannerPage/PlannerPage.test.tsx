import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerPage } from "./PlannerPage";

describe("PlannerPage", () => {
  it("renders a main page landmark with an optional label relationship", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerPage,
        {
          children: createElement("h1", { id: "route-title" }, "Route title"),
          className: "route-page",
          labelledBy: "route-title",
          width: "narrow"
        }
      )
    );

    expect(markup).toContain("<main");
    expect(markup).toContain('id="planner-main"');
    expect(markup).toContain('data-width="narrow"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain('aria-labelledby="route-title"');
    expect(markup).toContain("planner-page route-page");
  });
});
