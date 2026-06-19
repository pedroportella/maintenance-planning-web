import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.MP_PLAYWRIGHT_REVIEWER_PORT ?? "3103", 10);
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /reviewer-pack\.visual\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  webServer: {
    command: `pnpm --dir apps/planner-workbench dev --hostname ${host} --port ${port}`,
    env: {
      MAINTENANCE_PLANNING_WEB_DATA_MODE: "mock",
      MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO: "baseline-week"
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
      name: "reviewer-desktop",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 1,
        viewport: {
          height: 1100,
          width: 1440
        }
      }
    }
  ]
});
