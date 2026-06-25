import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.MP_PLAYWRIGHT_MOCK_PORT ?? "3100", 10);
const runningDevServer = readRunningDevServer();
const baseURL = runningDevServer?.appUrl ?? `http://${host}:${port}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: [/.*\.backend\.spec\.ts/, /.*\.visual\.spec\.ts/],
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  webServer: {
    command: `pnpm --dir apps/planner-workbench dev --hostname ${host} --port ${port}`,
    env: {
      MAINTENANCE_PLANNING_WEB_DATA_MODE: "mock"
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
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

function readRunningDevServer() {
  if (process.env.MP_PLAYWRIGHT_MOCK_PORT || process.env.CI) {
    return null;
  }

  const lockPath = fileURLToPath(
    new URL("apps/planner-workbench/.next/dev/lock", import.meta.url)
  );

  if (!existsSync(lockPath)) {
    return null;
  }

  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    if (
      typeof lock.appUrl === "string" &&
      typeof lock.pid === "number" &&
      isProcessRunning(lock.pid)
    ) {
      return {
        appUrl: lock.appUrl
      };
    }
  } catch {
    return null;
  }

  return null;
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
