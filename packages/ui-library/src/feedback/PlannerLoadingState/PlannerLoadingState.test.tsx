import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerLoadingState } from "./PlannerLoadingState";

describe("PlannerLoadingState", () => {
  it("publishes status semantics and Radix spinner/skeleton surfaces", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerLoadingState, {
        label: "Loading queue",
        skeletonRows: 3
      })
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("rt-Spinner");
    expect(markup).toContain("rt-Skeleton");
    expect(markup).toContain("Loading queue");
  });
});
