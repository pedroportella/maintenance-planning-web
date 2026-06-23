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
          labelledBy: "route-title"
        }
      )
    );

    expect(markup).toContain("<main");
    expect(markup).toContain('aria-labelledby="route-title"');
    expect(markup).toContain("planner-page route-page");
  });
});
