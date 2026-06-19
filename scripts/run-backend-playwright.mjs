#!/usr/bin/env node

import { spawn } from "node:child_process";
import { loadLocalEnv } from "./env-loader.mjs";

const env = loadLocalEnv();
const apiUrl = env.MAINTENANCE_PLANNING_API_URL?.trim();

if (!apiUrl) {
  console.error("Backend end-to-end smoke requires MAINTENANCE_PLANNING_API_URL.");
  console.error(
    "Start the local API, seed a deterministic simulator scenario, then set MAINTENANCE_PLANNING_API_URL in .env.local or the process environment."
  );
  process.exit(1);
}

try {
  const parsed = new URL(apiUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
} catch {
  console.error("MAINTENANCE_PLANNING_API_URL must be an absolute HTTP or HTTPS URL.");
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [
    "scripts/run-playwright.mjs",
    "test",
    "--config",
    "playwright.backend.config.mjs",
    ...process.argv.slice(2)
  ],
  {
    cwd: process.cwd(),
    env: {
      ...env,
      MAINTENANCE_PLANNING_API_URL: apiUrl,
      MAINTENANCE_PLANNING_WEB_DATA_MODE: "backend"
    },
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
