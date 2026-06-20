import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.MP_PLAYWRIGHT_BACKEND_PORT ?? "3101", 10);
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.backend\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 15_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  webServer: {
    command: `pnpm --dir apps/planner-workbench dev --hostname ${host} --port ${port}`,
    env: {
      MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC:
        process.env.MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC ?? "2026-01-30T00:00:00Z",
      MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC:
        process.env.MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC ?? "2026-01-16T00:00:00Z",
      MAINTENANCE_PLANNING_WEB_BACKEND_REQUESTED_BY:
        process.env.MAINTENANCE_PLANNING_WEB_BACKEND_REQUESTED_BY ?? "planner-workbench-e2e",
      MAINTENANCE_PLANNING_API_URL: process.env.MAINTENANCE_PLANNING_API_URL ?? "",
      MAINTENANCE_PLANNING_API_TOKEN: process.env.MAINTENANCE_PLANNING_API_TOKEN ?? "",
      MAINTENANCE_PLANNING_WEB_DATA_MODE: "backend"
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL
  },
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
