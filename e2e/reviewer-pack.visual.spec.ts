import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const screenshotDir = join("test-results", "reviewer-pack");

test("captures the reviewer pack screenshots", async ({ page }) => {
  mkdirSync(screenshotDir, { recursive: true });

  await capture(page, "/", "planner-coordination-queue.png", "Planner coordination queue");
  await capture(page, "/recommendations", "planner-recommendations.png", "Recommendations");
  await capture(page, "/operations-posture", "operations-posture.png", "Operations posture");
  await capture(page, "/scenario-outcomes", "scenario-outcomes.png", "Scenario outcomes");
  await capture(page, "/ui-library", "ui-library-showcase.png", "UI library showcase");
});

async function capture(page: Page, route: string, fileName: string, heading: string) {
  await page.goto(route);
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
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
