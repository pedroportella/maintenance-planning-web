import { expect, type Page } from "@playwright/test";
import type { UiLibraryTheme } from "./contrast-samples";

const themeStorageKey = "planner-workbench-theme";

export async function openUiLibrary(page: Page, theme: UiLibraryTheme) {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [themeStorageKey, theme]
  );

  await page.goto("/ui-library");
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();
}

export async function hideLocalDevChrome(page: Page) {
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
