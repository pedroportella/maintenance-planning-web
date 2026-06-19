import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.MP_PLAYWRIGHT_SHOWCASE_PORT ?? "3102", 10);
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /ui-library-showcase(\.visual)?\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.015
    }
  },
  fullyParallel: false,
  reporter: [["list"]],
  snapshotPathTemplate: "{testDir}/__visual-baselines__/{arg}{ext}",
  webServer: {
    command: `pnpm --dir apps/planner-workbench dev --hostname ${host} --port ${port}`,
    env: {
      MAINTENANCE_PLANNING_WEB_DATA_MODE: "mock",
      MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO: "parts-delay-replan"
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: baseURL
  },
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "showcase-desktop",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 1,
        viewport: {
          height: 1400,
          width: 1440
        }
      }
    },
    {
      name: "showcase-mobile",
      use: {
        ...devices["Pixel 5"],
        deviceScaleFactor: 1
      }
    }
  ]
});
