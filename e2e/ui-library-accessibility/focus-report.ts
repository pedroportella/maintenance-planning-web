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

    function hasVisibleOutline(style: CSSStyleDeclaration) {
      return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2;
    }

    function readFocusIndicatorEntry(element: HTMLElement, label: string) {
      const styles = getComputedStyle(element);
      const beforeStyles = getComputedStyle(element, "::before");
      const afterStyles = getComputedStyle(element, "::after");
      const adjacentFocusRing =
        element.nextElementSibling instanceof HTMLElement &&
        element.nextElementSibling.classList.contains("rt-ScrollAreaViewportFocusRing")
          ? getComputedStyle(element.nextElementSibling)
          : null;
      const hasIndicator = [styles, beforeStyles, afterStyles, adjacentFocusRing].some(
        (style) => style !== null && hasVisibleOutline(style)
      );

      return {
        hasIndicator,
        label,
        adjacentFocusRingOutline: adjacentFocusRing
          ? `${adjacentFocusRing.outlineWidth} ${adjacentFocusRing.outlineStyle} ${adjacentFocusRing.outlineColor}`
          : "none",
        outline: `${styles.outlineWidth} ${styles.outlineStyle} ${styles.outlineColor}`,
        pseudoAfterOutline: `${afterStyles.outlineWidth} ${afterStyles.outlineStyle} ${afterStyles.outlineColor}`,
        pseudoBeforeOutline: `${beforeStyles.outlineWidth} ${beforeStyles.outlineStyle} ${beforeStyles.outlineColor}`,
        shadow: styles.boxShadow
      };
    }

    const focusable = Array.from(document.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(isVisible)
      .slice(0, 24);
    const focused = focusable.map((element) => {
      element.focus();
      const entry = readFocusIndicatorEntry(element, labelFor(element));

      return entry;
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

export async function collectKeyboardFocusReport(page: Page, tabStops = 16) {
  const entries = [];

  for (let step = 1; step <= tabStops; step += 1) {
    await page.keyboard.press("Tab");
    entries.push(
      await page.evaluate((currentStep) => {
        function labelFor(element: Element) {
          const name =
            element.getAttribute("aria-label")?.trim() ??
            element.textContent?.replace(/\s+/g, " ").trim() ??
            element.getAttribute("name")?.trim() ??
            element.tagName.toLowerCase();
          const classes = Array.from(element.classList).slice(0, 3).join(".");

          return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}: ${name}`;
        }

        function hasVisibleOutline(style: CSSStyleDeclaration) {
          return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2;
        }

        function readFocusIndicatorEntry(element: HTMLElement, label: string) {
          const styles = getComputedStyle(element);
          const beforeStyles = getComputedStyle(element, "::before");
          const afterStyles = getComputedStyle(element, "::after");
          const adjacentFocusRing =
            element.nextElementSibling instanceof HTMLElement &&
            element.nextElementSibling.classList.contains("rt-ScrollAreaViewportFocusRing")
              ? getComputedStyle(element.nextElementSibling)
              : null;
          const hasIndicator = [styles, beforeStyles, afterStyles, adjacentFocusRing].some(
            (style) => style !== null && hasVisibleOutline(style)
          );

          return {
            hasIndicator,
            label,
            adjacentFocusRingOutline: adjacentFocusRing
              ? `${adjacentFocusRing.outlineWidth} ${adjacentFocusRing.outlineStyle} ${adjacentFocusRing.outlineColor}`
              : "none",
            outline: `${styles.outlineWidth} ${styles.outlineStyle} ${styles.outlineColor}`,
            pseudoAfterOutline: `${afterStyles.outlineWidth} ${afterStyles.outlineStyle} ${afterStyles.outlineColor}`,
            pseudoBeforeOutline: `${beforeStyles.outlineWidth} ${beforeStyles.outlineStyle} ${beforeStyles.outlineColor}`,
            shadow: styles.boxShadow
          };
        }

        function isLocalDevChrome(element: HTMLElement) {
          return Boolean(
            element.closest(
              [
                "nextjs-portal",
                "[data-nextjs-dialog-overlay]",
                "[data-nextjs-dev-tools-button]",
                "[data-next-badge-root]",
                "[data-nextjs-toast]",
                ".__nextjs-dev-overlay"
              ].join(",")
            )
          );
        }

        const element = document.activeElement;

        if (
          !(element instanceof HTMLElement) ||
          element === document.body ||
          isLocalDevChrome(element)
        ) {
          return {
            focusable: false,
            hasIndicator: false,
            label: "document body",
            outline: "none",
            shadow: "none",
            step: currentStep
          };
        }

        return {
          ...readFocusIndicatorEntry(element, labelFor(element)),
          focusable: true,
          step: currentStep
        };
      }, step)
    );
  }

  return {
    focused: entries,
    missingIndicator: entries
      .filter((entry) => entry.focusable && !entry.hasIndicator)
      .map((entry) => entry.label),
    tabStops
  };
}
