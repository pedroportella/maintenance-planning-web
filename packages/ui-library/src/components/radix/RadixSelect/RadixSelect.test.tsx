import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerThemeProvider } from "../../../theme/PlannerThemeProvider";
import { RadixSelect } from "./RadixSelect";

describe("RadixSelect", () => {
  it("renders a labelled combobox trigger and options", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerThemeProvider,
        {
          children: createElement(RadixSelect, {
            "aria-describedby": "reason-hint",
            id: "decision-reason",
            name: "decisionReason",
            options: [
              {
                label: "Parts readiness",
                value: "parts-readiness"
              },
              {
                label: "Crew capacity",
                value: "crew-capacity"
              }
            ],
            placeholder: "Choose a reason"
          }),
          forcedAppearance: "light"
        }
      )
    );

    expect(markup).toContain('id="decision-reason"');
    expect(markup).toContain('aria-describedby="reason-hint"');
    expect(markup).toContain("Choose a reason");
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('name="decisionReason"');
  });
});
