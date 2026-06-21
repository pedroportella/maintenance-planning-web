import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const screenshotDir = join("test-results", "reviewer-pack");

test("captures the reviewer pack screenshots", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });

  await capture(page, "/", "planner-workbench-start.png", "Planner Workbench");
  await capture(page, "/recommendations", "planner-recommendations.png", "Recommendations", {
    tableName: "Package recommendation queue"
  });
  await capture(page, "/operations-posture", "operations-posture.png", "Operations posture", {
    tableName: "Operations posture signals"
  });
  await capture(page, "/scenario-outcomes", "scenario-outcomes.png", "Scenario outcomes", {
    tableName: "Synthetic scenario outcomes"
  });
  await capture(page, "/ui-library", "ui-library-showcase.png", "UI library showcase");
});

async function capture(
  page: Page,
  route: string,
  fileName: string,
  heading: string,
  readyState?: {
    tableName?: string;
  }
) {
  await page.goto(route);
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  if (readyState?.tableName) {
    await expect(page.getByRole("table", { name: readyState.tableName })).toBeVisible();
  }
  await hideLocalDevChrome(page);
  await page.screenshot({
    fullPage: true,
    path: join(screenshotDir, fileName)
  });
}

async function hideLocalDevChrome(page: Page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-dialog-overlay],
      [data-nextjs-dev-tools-button],
      [data-next-badge-root],
      [data-nextjs-toast],
      .__nextjs-dev-overlay {
        display: none !important;
        visibility: hidden !important;
      }
    `
  });
}
