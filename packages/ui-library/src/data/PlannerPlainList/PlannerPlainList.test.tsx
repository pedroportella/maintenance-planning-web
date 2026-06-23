import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerPlainList } from "./PlannerPlainList";

describe("PlannerPlainList", () => {
  it("renders unbulleted operational lists with an optional label", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerPlainList,
        {
          ariaLabel: "Decision history",
          children: [
            createElement("li", { key: "accepted" }, "Accepted"),
            createElement("li", { key: "deferred" }, "Deferred")
          ]
        }
      )
    );

    expect(markup).toContain('aria-label="Decision history"');
    expect(markup).toContain("planner-plain-list");
    expect(markup).toContain("<li>Accepted</li>");
  });
});
