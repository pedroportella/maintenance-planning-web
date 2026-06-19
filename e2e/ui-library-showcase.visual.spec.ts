import { expect, test } from "@playwright/test";

test("matches the UI library showcase visual baseline", async ({ page }, testInfo) => {
  await page.goto("/ui-library");
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();
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
  await expect(page).toHaveScreenshot(`ui-library-showcase-${testInfo.project.name}.png`, {
    fullPage: true
  });
});
