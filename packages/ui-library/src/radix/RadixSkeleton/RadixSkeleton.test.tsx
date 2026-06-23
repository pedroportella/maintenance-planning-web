import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixSkeleton } from "./RadixSkeleton";

describe("RadixSkeleton", () => {
  it("renders an inert Radix skeleton through the local adapter", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixSkeleton, {
        height: "18px",
        width: "72%"
      })
    );

    expect(markup).toContain("rt-Skeleton");
    expect(markup).toContain("radix-skeleton");
    expect(markup).toContain("aria-hidden=");
  });
});
