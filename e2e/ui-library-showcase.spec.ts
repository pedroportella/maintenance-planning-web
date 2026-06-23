import { expect, type Locator, test } from "@playwright/test";

const tones = ["critical", "info", "neutral", "success", "warning"] as const;

test("renders the UI library evidence route with accessible landmarks and state names", async ({
  page
}) => {
  await page.goto("/ui-library");

  await expect(page).toHaveTitle(/UI Library Evidence/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("main")).toBeVisible();
  const plannerNavigation = page.getByRole("navigation", { name: "Planner sections" });

  if (!(await plannerNavigation.isVisible())) {
    await page
      .locator(
        ".planner-theme > .planner-app-layout > .planner-app-layout-header .planner-app-layout-menu-button"
      )
      .click();
  }

  await expect(plannerNavigation).toBeVisible();
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Alerts and badges" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tables and row states" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Empty, loading and error states" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommendation cards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operations posture summaries" })).toBeVisible();

  await expect(page.getByRole("table", { name: "UI showcase work-order rows" })).toBeVisible();
  await expect(page.getByRole("table", { name: "UI showcase empty table" })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "UI showcase operations posture signals" })
  ).toBeVisible();
  await expect(page.getByRole("article", { name: "PKG-PARTS-REPLAN" })).toBeVisible();
  await expect(page.getByRole("article", { name: "PKG-PARTS-BLOCKED" })).toBeVisible();

  await expect(page.locator(".loading-state[role='status']")).toContainText(
    "Loading planner review data"
  );
  await expect(page.locator(".error-state[role='alert']")).toContainText(
    "Review state unavailable"
  );
  await expect(page.locator(".workbench-alert-warning[role='alert']").first()).toContainText(
    "Warning alert"
  );
  await expect(
    page.locator(".workbench-alert-info[role='status']").filter({ hasText: "Info alert" })
  ).toBeVisible();

  for (const tone of tones) {
    await expect(page.locator(`.status-badge-${tone}`).first()).toBeVisible();
    await expect(page.locator(`.workbench-alert-${tone}`).first()).toBeVisible();
  }
});

test("keeps contrast-sensitive showcase tones readable", async ({ page }) => {
  await page.goto("/ui-library");

  for (const tone of tones) {
    const badgeRatio = await contrastRatio(page.locator(`.status-badge-${tone}`).first());
    expect(badgeRatio, `${tone} status badge contrast`).toBeGreaterThanOrEqual(4.5);

    const alertTitleRatio = await contrastRatio(
      page.locator(`.workbench-alert-${tone} strong`).first()
    );
    expect(alertTitleRatio, `${tone} alert title contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

async function contrastRatio(locator: Locator) {
  return locator.evaluate((element) => {
    function parseCssColor(value: string) {
      const match = value.match(/rgba?\(([^)]+)\)/);

      if (!match) {
        throw new Error(`Unsupported CSS color: ${value}`);
      }

      const parts = match[1]
        .split(",")
        .map((part) => Number.parseFloat(part.trim().replace("%", "")));

      return {
        alpha: parts[3] ?? 1,
        blue: parts[2] ?? 0,
        green: parts[1] ?? 0,
        red: parts[0] ?? 0
      };
    }

    function findOpaqueBackground(target: Element) {
      let current: Element | null = target;

      while (current) {
        const background = parseCssColor(getComputedStyle(current).backgroundColor);

        if (background.alpha > 0) {
          return background;
        }

        current = current.parentElement;
      }

      return {
        alpha: 1,
        blue: 255,
        green: 255,
        red: 255
      };
    }

    function relativeLuminance(color: { blue: number; green: number; red: number }) {
      const [red, green, blue] = [color.red, color.green, color.blue].map((channel) => {
        const normalized = channel / 255;

        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });

      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function ratio(
      first: { blue: number; green: number; red: number },
      second: { blue: number; green: number; red: number }
    ) {
      const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
      const darker = Math.min(relativeLuminance(first), relativeLuminance(second));

      return (lighter + 0.05) / (darker + 0.05);
    }

    const foreground = parseCssColor(getComputedStyle(element).color);
    const background = findOpaqueBackground(element);

    return ratio(foreground, background);
  });
}
