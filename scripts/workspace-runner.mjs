#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const scriptName = process.argv[2];
const root = process.cwd();
const workspaceRoots = ["apps", "packages"];

if (!scriptName) {
  console.error("Usage: node scripts/workspace-runner.mjs <script>");
  process.exit(1);
}

const projects = listWorkspaceProjects();
let executed = 0;

for (const project of projects) {
  const manifest = JSON.parse(readFileSync(project.manifestPath, "utf8"));
  if (!manifest.scripts?.[scriptName]) continue;

  executed += 1;
  const displayPath = relative(root, project.directory).replaceAll("\\", "/");
  console.log(`Running ${scriptName} in ${displayPath}`);

  const result = spawnSync("pnpm", ["--dir", project.directory, "run", scriptName], {
    stdio: "inherit"
  });

  if (result.error) {
    console.error(`Failed to run ${scriptName} in ${displayPath}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (executed === 0) {
  console.log(`Workspace ${scriptName} skipped: no package scripts found.`);
}

function listWorkspaceProjects() {
  const projects = [];

  for (const workspaceRoot of workspaceRoots) {
    const fullWorkspaceRoot = join(root, workspaceRoot);
    if (!existsSync(fullWorkspaceRoot)) continue;

    for (const entry of readdirSync(fullWorkspaceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const directory = join(fullWorkspaceRoot, entry.name);
      const manifestPath = join(directory, "package.json");
      if (existsSync(manifestPath)) {
        projects.push({ directory, manifestPath });
      }
    }
  }

  return projects.sort((left, right) => left.directory.localeCompare(right.directory));
}
