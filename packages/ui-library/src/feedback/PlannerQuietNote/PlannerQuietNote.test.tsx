import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerQuietNote } from "./PlannerQuietNote";

describe("PlannerQuietNote", () => {
  it("renders quiet secondary context without alert semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerQuietNote, {
        children: "Synthetic local review only.",
        title: "Scope"
      })
    );

    expect(markup).toContain("planner-quiet-note");
    expect(markup).toContain('data-icon="reader"');
    expect(markup).toContain("Scope");
    expect(markup).not.toContain('role="alert"');
  });
});
