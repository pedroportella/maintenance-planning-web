import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerThemeProvider } from "../../theme/PlannerThemeProvider";
import { PlannerSelect } from "./PlannerSelect";

describe("PlannerSelect", () => {
  it("renders select options inside shared field semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerThemeProvider,
        {
          children: createElement(PlannerSelect, {
            hint: "Pick the closest review reason.",
            label: "Reason",
            name: "reason",
            options: [
              {
                label: "Parts readiness",
                value: "parts-readiness"
              }
            ],
            placeholder: "Choose reason"
          }),
          forcedAppearance: "light"
        }
      )
    );

    expect(markup).toContain('for="reason"');
    expect(markup).toContain("Pick the closest review reason.");
    expect(markup).toContain("Choose reason");
    expect(markup).toContain('role="combobox"');
  });
});
