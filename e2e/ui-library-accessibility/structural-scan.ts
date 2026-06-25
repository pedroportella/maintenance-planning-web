import type { Page } from "@playwright/test";

export async function collectStructuralAccessibilityScan(page: Page) {
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

    function textFromIds(value: string | null) {
      return (value ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    function accessibleName(element: Element) {
      const explicitLabel = element.getAttribute("aria-label")?.trim();
      if (explicitLabel) return explicitLabel;

      const labelledBy = textFromIds(element.getAttribute("aria-labelledby"));
      if (labelledBy) return labelledBy;

      const id = element.getAttribute("id");
      if (id) {
        const label = document.querySelector(`label[for='${CSS.escape(id)}']`);
        const labelText = label?.textContent?.trim();
        if (labelText) return labelText;
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        const closestLabel = element.closest("label")?.textContent?.trim();
        if (closestLabel) return closestLabel;
        if (element.placeholder) return element.placeholder.trim();
      }

      if (element instanceof HTMLImageElement) {
        return element.alt.trim();
      }

      return (
        element.textContent?.replace(/\s+/g, " ").trim() ??
        element.getAttribute("title")?.trim() ??
        ""
      );
    }

    function elementLabel(element: Element) {
      const role = element.getAttribute("role") ?? element.tagName.toLowerCase();
      const name = accessibleName(element);
      const classes = Array.from(element.classList).slice(0, 3).join(".");
      return `${role}${classes ? `.${classes}` : ""}${name ? `: ${name}` : ""}`;
    }

    const interactiveSelector = [
      "a[href]",
      "button",
      "input:not([type='hidden'])",
      "select",
      "summary",
      "textarea",
      "[role='button']",
      "[role='checkbox']",
      "[role='combobox']",
      "[role='link']",
      "[role='menuitem']",
      "[role='radio']",
      "[role='searchbox']",
      "[role='switch']",
      "[role='tab']",
      "[role='textbox']"
    ].join(",");
    const visibleControls = Array.from(document.querySelectorAll(interactiveSelector)).filter(
      (element) => !isHidden(element)
    );
    const unlabeledControls = visibleControls
      .filter((element) => accessibleName(element).length === 0)
      .map(elementLabel);
    const positiveTabIndex = Array.from(document.querySelectorAll("[tabindex]"))
      .filter((element) => !isHidden(element))
      .filter((element) => Number.parseInt(element.getAttribute("tabindex") ?? "0", 10) > 0)
      .map(elementLabel);
    const unlabeledImages = Array.from(document.querySelectorAll("img, [role='img']"))
      .filter((element) => !isHidden(element))
      .filter((element) => accessibleName(element).length === 0)
      .map(elementLabel);
    const labelInNameFailures = visibleControls
      .filter((element) => {
        const visibleText = element.textContent?.replace(/\s+/g, " ").trim();
        if (!visibleText || visibleText.length < 2) return false;

        return !accessibleName(element).toLowerCase().includes(visibleText.toLowerCase());
      })
      .map(elementLabel);
    const missingPageLanguage = !document.documentElement.lang;
    const pageTitle = document.title.trim();

    return {
      controlCount: visibleControls.length,
      labelInNameFailures,
      missingPageLanguage,
      pageTitle,
      positiveTabIndex,
      unlabeledControls,
      unlabeledImages
    };
  });
}
