import { defineConfig } from "@playwright/test";
import showcaseConfig from "./playwright.showcase.config.mjs";

export default defineConfig({
  ...showcaseConfig,
  grep: /matches the UI library showcase visual baseline/,
  testMatch: /ui-library-showcase\.visual\.spec\.ts/
});
