import type { Page } from "@playwright/test";

export async function collectIconAndTargetSizeReport(page: Page) {
  return page.evaluate(() => {
    function isHidden(element: Element) {
      if (element.closest("[hidden], [aria-hidden='true']")) {
        return true;
      }

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width === 0 ||
        rect.height === 0
      );
    }

    function accessibleName(element: Element) {
      return (
        element.getAttribute("aria-label")?.trim() ??
        element.textContent?.replace(/\s+/g, " ").trim() ??
        element.getAttribute("title")?.trim() ??
        ""
      );
    }

    function labelFor(element: Element) {
      const name = accessibleName(element);
      const classes = Array.from(element.classList).slice(0, 3).join(".");
      return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}${
        name ? `: ${name}` : ""
      }`;
    }

    const interactiveSelector = [
      "a[href]",
      "button",
      "input:not([type='hidden'])",
      "select",
      "textarea",
      "[role='button']",
      "[role='checkbox']",
      "[role='combobox']",
      "[role='link']",
      "[role='radio']",
      "[role='switch']",
      "[role='tab']"
    ].join(",");
    const controls = Array.from(document.querySelectorAll(interactiveSelector)).filter(
      (element) => !isHidden(element)
    );
    const targetSizes = controls.map((element) => {
      const rect = element.getBoundingClientRect();
      const label = labelFor(element);
      const height = Math.round(rect.height * 10) / 10;
      const width = Math.round(rect.width * 10) / 10;

      return {
        height,
        label,
        under24: width < 24 || height < 24,
        under44: width < 44 || height < 44,
        width
      };
    });
    const pairedIconFailures = Array.from(document.querySelectorAll("button, a[href]"))
      .filter((element) => !isHidden(element))
      .filter((element) => (element.textContent?.trim().length ?? 0) > 0)
      .flatMap((element) =>
        Array.from(element.querySelectorAll("svg")).map((svg) => ({
          hidden:
            svg.getAttribute("aria-hidden") === "true" ||
            Boolean(svg.closest("[aria-hidden='true']")),
          label: labelFor(element)
        }))
      )
      .filter((icon) => !icon.hidden)
      .map((icon) => icon.label);
    const iconOnlyControls = controls
      .filter(
        (element) =>
          element.matches("a[href], button, [role='button'], [role='link']") &&
          Boolean(element.querySelector("svg")) &&
          (element.textContent?.trim().length ?? 0) === 0
      )
      .map((element) => ({
        label: labelFor(element),
        named: accessibleName(element).length > 0
      }));

    return {
      iconOnlyControls,
      pairedIconFailures,
      targetSizes,
      under24: targetSizes.filter((target) => target.under24),
      under44Count: targetSizes.filter((target) => target.under44).length
    };
  });
}
