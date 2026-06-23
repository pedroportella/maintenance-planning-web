import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerPagination } from "./PlannerPagination";

describe("PlannerPagination", () => {
  it("renders accessible range and page labels", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerPagination, {
        currentPage: 2,
        pageSize: 10,
        totalItems: 42
      })
    );

    expect(markup).toContain('aria-label="Table pagination"');
    expect(markup).toContain("Showing 11-20 of 42");
    expect(markup).toContain("Page 2 of 5");
    expect(markup).toContain('aria-label="Previous page"');
    expect(markup).toContain('aria-label="Next page"');
  });

  it("can render URL-addressable page controls without router imports", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerPagination, {
        currentPage: 1,
        hrefForPage: (page) => `/work-order-backlog?page=${page}`,
        pageSize: 5,
        totalItems: 12
      })
    );

    expect(markup).toContain('aria-label="Previous page"');
    expect(markup).toContain("disabled");
    expect(markup).toContain('href="/work-order-backlog?page=2"');
  });
});
