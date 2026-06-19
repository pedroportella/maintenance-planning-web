#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const imageName = process.env.IMAGE_NAME ?? process.argv[2] ?? "maintenance-planning-web:local";
const hostPort = process.env.HOST_PORT ?? "3104";
const containerName = process.env.CONTAINER_NAME ?? "maintenance-planning-web-local";
const containerEnv = resolveContainerEnv();

const runArgs = [
  "run",
  "--rm",
  "--name",
  containerName,
  "-p",
  `${hostPort}:8080`
];

for (const [name, value] of containerEnv) {
  runArgs.push("-e", `${name}=${value}`);
}

runArgs.push(imageName);

console.log(`Running ${imageName} at http://localhost:${hostPort}.`);
execFileSync("docker", runArgs, { stdio: "inherit" });

function resolveContainerEnv() {
  const dataMode = process.env.MAINTENANCE_PLANNING_WEB_DATA_MODE ?? "mock";
  const values = new Map([
    ["MAINTENANCE_PLANNING_WEB_DATA_MODE", dataMode],
    [
      "MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO",
      process.env.MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO ?? "baseline-week"
    ]
  ]);

  if (dataMode === "mock") {
    values.set(
      "MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS",
      process.env.MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS ?? "true"
    );
  }

  copyEnvIfPresent(values, "MAINTENANCE_PLANNING_API_URL");
  copyEnvIfPresent(values, "MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_START_UTC");
  copyEnvIfPresent(values, "MAINTENANCE_PLANNING_WEB_BACKEND_HORIZON_END_UTC");
  copyEnvIfPresent(values, "MAINTENANCE_PLANNING_WEB_BACKEND_REQUESTED_BY");

  return values.entries();
}

function copyEnvIfPresent(values, name) {
  const value = process.env[name];
  if (value) {
    values.set(name, value);
  }
}
