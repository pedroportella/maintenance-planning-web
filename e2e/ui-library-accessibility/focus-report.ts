import type { Page } from "@playwright/test";

export async function collectFocusReport(page: Page) {
  return page.evaluate(() => {
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    function isVisible(element: Element) {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    }

    function labelFor(element: Element) {
      const name =
        element.getAttribute("aria-label")?.trim() ??
        element.textContent?.replace(/\s+/g, " ").trim() ??
        element.getAttribute("name")?.trim() ??
        element.tagName.toLowerCase();
      const classes = Array.from(element.classList).slice(0, 3).join(".");

      return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}: ${name}`;
    }

    const focusable = Array.from(document.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(isVisible)
      .slice(0, 24);
    const focused = focusable.map((element) => {
      element.focus();
      const styles = getComputedStyle(element);
      const hasOutline =
        styles.outlineStyle !== "none" && Number.parseFloat(styles.outlineWidth) > 0;
      const hasShadow = styles.boxShadow !== "none";

      return {
        hasIndicator: hasOutline || hasShadow,
        label: labelFor(element),
        outline: `${styles.outlineWidth} ${styles.outlineStyle} ${styles.outlineColor}`,
        shadow: styles.boxShadow
      };
    });

    return {
      focusableCount: focusable.length,
      focused,
      missingIndicator: focused
        .filter((entry) => !entry.hasIndicator)
        .map((entry) => entry.label)
    };
  });
}
