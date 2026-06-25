import type { Page } from "@playwright/test";

export async function collectReducedMotionReport(page: Page) {
  return page.evaluate(() => {
    function durationToMs(value: string) {
      return value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) =>
          part.endsWith("ms") ? Number.parseFloat(part) : Number.parseFloat(part) * 1000
        )
        .filter((duration) => Number.isFinite(duration));
    }

    const animatedElements = Array.from(document.querySelectorAll("*"))
      .map((element) => {
        const styles = getComputedStyle(element);
        const durations = [
          ...durationToMs(styles.animationDuration),
          ...durationToMs(styles.transitionDuration)
        ];
        const longestDuration = Math.max(0, ...durations);

        return {
          className: Array.from(element.classList).slice(0, 3).join(" "),
          longestDuration,
          tagName: element.tagName.toLowerCase()
        };
      })
      .filter((entry) => entry.longestDuration > 0)
      .slice(0, 40);

    return {
      animatedElements,
      reduceMatches: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
}

export async function collectOverflowReport(page: Page) {
  return page.evaluate(() => {
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

    const viewportWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.body.querySelectorAll("*"))
      .filter((element) => isVisible(element))
      .filter((element) => !element.closest(".planner-data-table-region"))
      .map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          className: Array.from(element.classList).slice(0, 3).join(" "),
          right: Math.round(rect.right),
          tagName: element.tagName.toLowerCase(),
          width: Math.round(rect.width)
        };
      })
      .filter((element) => element.right > viewportWidth + 1)
      .slice(0, 30);

    return {
      documentWidth: document.documentElement.scrollWidth,
      offenders,
      viewportWidth,
      visibleBody: isVisible(document.body)
    };
  });
}
