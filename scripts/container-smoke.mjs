#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const imageName = args.image ?? process.env.IMAGE_NAME ?? "maintenance-planning-web:local";
const hostPort = process.env.HOST_PORT ?? "3104";
const containerName =
  process.env.CONTAINER_NAME ?? `maintenance-planning-web-smoke-${Date.now()}`;

if (!args.skipBuild) {
  execFileSync("node", ["scripts/container-build.mjs"], {
    env: { ...process.env, IMAGE_NAME: imageName },
    stdio: "inherit"
  });
}

inspectImage(imageName);
inspectRuntimeFiles(imageName);
inspectBrowserVisibleOrigins(imageName);

let containerStarted = false;

try {
  execFileSync(
    "docker",
    [
      "run",
      "--detach",
      "--name",
      containerName,
      "--read-only",
      "--cap-drop=ALL",
      "--security-opt",
      "no-new-privileges",
      "--memory=512m",
      "--cpus=0.5",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=64m",
      "-p",
      `${hostPort}:8080`,
      "-e",
      "MAINTENANCE_PLANNING_WEB_DATA_MODE=mock",
      "-e",
      "MAINTENANCE_PLANNING_WEB_ALLOW_MOCKS=true",
      "-e",
      "MAINTENANCE_PLANNING_WEB_MOCK_SCENARIO=baseline-week",
      imageName
    ],
    { stdio: "inherit" }
  );
  containerStarted = true;

  await waitForRoute("/health/live");

  for (const route of ["/", "/recommendations", "/operations-posture", "/ui-library"]) {
    await fetchRoute(route);
    console.log(`${route} passed.`);
  }

  const exitCode = stopContainer();
  console.log(`Container smoke passed for ${imageName}; exit code ${exitCode}.`);
} catch (error) {
  printContainerLogs();
  throw error;
} finally {
  if (containerStarted) {
    spawnSync("docker", ["rm", "-f", containerName], { stdio: "ignore" });
  }
}

function inspectImage(image) {
  const output = execFileSync("docker", ["image", "inspect", image], {
    encoding: "utf8"
  });
  const [imageConfig] = JSON.parse(output);
  const labels = imageConfig.Config.Labels ?? {};

  assert.equal(imageConfig.Config.User, "10001:10001", "image must run as the planner user");
  assert.ok(imageConfig.Config.ExposedPorts?.["8080/tcp"], "image must expose port 8080");
  assert.equal(labels["org.opencontainers.image.title"], "maintenance-planning-web");
  assert.ok(labels["org.opencontainers.image.revision"], "image must carry a revision label");
}

function inspectRuntimeFiles(image) {
  const inspector = [
    "const fs = require('node:fs');",
    "const path = require('node:path');",
    "const roots = ['/app'];",
    "const forbiddenExact = [",
    "'/app/.git','/app/.github','/app/.aws','/app/docs','/app/e2e',",
    "'/app/test-results','/app/playwright-report','/app/apps/planner-workbench/test-results',",
    "'/app/apps/planner-workbench/playwright-report'",
    "];",
    "const forbiddenDirs = new Set(['coverage','test-results','playwright-report','.aws','.git']);",
    "const failures = forbiddenExact.filter((entry) => fs.existsSync(entry));",
    "function walk(directory) {",
    "  if (!fs.existsSync(directory)) return;",
    "  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {",
    "    const fullPath = path.join(directory, entry.name);",
    "    if (entry.isDirectory()) {",
    "      if (forbiddenDirs.has(entry.name)) failures.push(fullPath);",
    "      walk(fullPath);",
    "      continue;",
    "    }",
    "    if (entry.isFile() && entry.name.startsWith('.env')) failures.push(fullPath);",
    "  }",
    "}",
    "for (const root of roots) walk(root);",
    "process.stdout.write(JSON.stringify({ failures }));",
    "process.exit(failures.length === 0 ? 0 : 1);"
  ].join("");

  const result = run("docker", ["run", "--rm", "--entrypoint", "node", image, "-e", inspector]);
  const inspection = JSON.parse(result.stdout);

  assert.deepEqual(inspection.failures, []);
}

function inspectBrowserVisibleOrigins(image) {
  const inspector = [
    "const fs = require('node:fs');",
    "const path = require('node:path');",
    "const roots = [",
    "'/app/apps/planner-workbench/.next/static',",
    "'/app/apps/planner-workbench/.next/server/app'",
    "];",
    "const extensions = new Set(['.css','.html','.js','.json','.rsc','.txt']);",
    "const patterns = [",
    "{ label: 'local workstation origin', pattern: /https?:\\/\\/(?:localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(?::\\d+)?/i },",
    "{ label: 'container host origin', pattern: /https?:\\/\\/host\\.docker\\.internal(?::\\d+)?/i },",
    "{ label: 'private network origin', pattern: /https?:\\/\\/(?:10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|192\\.168\\.\\d{1,3}\\.\\d{1,3}|172\\.(?:1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3})(?::\\d+)?/i },",
    "{ label: 'internal hostname origin', pattern: /https?:\\/\\/[a-z0-9.-]+\\.internal(?::\\d+)?/i }",
    "];",
    "const failures = [];",
    "function walk(directory) {",
    "  if (!fs.existsSync(directory)) return;",
    "  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {",
    "    const fullPath = path.join(directory, entry.name);",
    "    if (entry.isDirectory()) { walk(fullPath); continue; }",
    "    if (!entry.isFile() || !extensions.has(path.extname(entry.name).toLowerCase())) continue;",
    "    const contents = fs.readFileSync(fullPath, 'utf8');",
    "    for (const origin of patterns) {",
    "      if (origin.pattern.test(contents)) failures.push(`${fullPath} contains ${origin.label}`);",
    "    }",
    "  }",
    "}",
    "for (const root of roots) walk(root);",
    "process.stdout.write(JSON.stringify({ failures }));",
    "process.exit(failures.length === 0 ? 0 : 1);"
  ].join("");

  const result = run("docker", ["run", "--rm", "--entrypoint", "node", image, "-e", inspector]);
  const inspection = JSON.parse(result.stdout);

  assert.deepEqual(inspection.failures, []);
}

async function waitForRoute(route) {
  const deadline = Date.now() + 45_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await fetchRoute(route);
      console.log(`${route} passed.`);
      return;
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  throw new Error(`${route} did not pass: ${lastError?.message ?? "timed out"}`);
}

async function fetchRoute(route) {
  const url = `http://127.0.0.1:${hostPort}${route}`;
  const response = await fetch(url);
  const text = await response.text();

  assert.equal(response.ok, true, `${url} returned ${response.status}`);
  assertNoPrivateBackendOrigin(text, route);

  if (route === "/health/live") {
    const payload = JSON.parse(text);
    assert.equal(payload.status, "ok");
    assert.equal(payload.service, "planner-workbench");
  }
}

function assertNoPrivateBackendOrigin(contents, label) {
  const privateBackendOriginPatterns = [
    {
      label: "local workstation origin",
      pattern: /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?/i
    },
    {
      label: "container host origin",
      pattern: /https?:\/\/host\.docker\.internal(?::\d+)?/i
    },
    {
      label: "private network origin",
      pattern: /https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?/i
    },
    {
      label: "internal hostname origin",
      pattern: /https?:\/\/[a-z0-9.-]+\.internal(?::\d+)?/i
    }
  ];

  for (const origin of privateBackendOriginPatterns) {
    assert.equal(origin.pattern.test(contents), false, `${label} contains ${origin.label}`);
  }
}

function stopContainer() {
  execFileSync("docker", ["stop", "--timeout", "10", containerName], { stdio: "inherit" });

  const output = execFileSync("docker", ["inspect", "--format", "{{.State.ExitCode}}", containerName], {
    encoding: "utf8"
  }).trim();

  const exitCode = Number(output);
  if (!Number.isInteger(exitCode)) {
    throw new Error(`Could not read container exit code: ${output}`);
  }

  if (![0, 143].includes(exitCode)) {
    throw new Error(`Unexpected container exit code: ${exitCode}`);
  }

  return exitCode;
}

function printContainerLogs() {
  spawnSync("docker", ["logs", containerName], { stdio: "inherit" });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error([
      `${command} ${commandArgs.join(" ")} failed with status ${result.status}.`,
      result.stdout.trim(),
      result.stderr.trim()
    ].filter(Boolean).join("\n"));
  }

  return result;
}

function parseArgs(argv) {
  const parsed = {
    image: undefined,
    skipBuild: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--skip-build") {
      parsed.skipBuild = true;
      continue;
    }

    if (arg === "--image") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--image requires a value");
      }

      parsed.image = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return parsed;
}
