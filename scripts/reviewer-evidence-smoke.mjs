#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const requiredFiles = [
  "README.md",
  "AGENTS.md",
  ".cursorrules",
  ".dockerignore",
  ".gitignore",
  ".env.local.example",
  "Dockerfile",
  "package.json",
  "pnpm-workspace.yaml",
  ".github/workflows/ci.yml",
  "docs/architecture.md",
  "docs/api-integration.md",
  "docs/containerisation.md",
  "docs/guardrails.md",
  "docs/reviewer-pack.md",
  "docs/reviewer-runbook.md",
  "docs/future-hardening.md",
  "apps/planner-workbench/package.json",
  "apps/planner-workbench/README.md",
  "packages/services/package.json",
  "packages/services/README.md",
  "packages/ui-assets/package.json",
  "packages/ui-assets/README.md",
  "packages/ui-library/package.json",
  "packages/ui-library/README.md",
  "packages/ui-tokens/package.json",
  "packages/ui-tokens/README.md",
  "packages/utils/package.json",
  "packages/utils/README.md",
  "scripts/workspace-runner.mjs",
  "scripts/quality-guards.mjs",
  "scripts/markdown-link-check.mjs",
  "scripts/env-loader.mjs",
  "scripts/container-build.mjs",
  "scripts/container-run.mjs",
  "scripts/container-smoke.mjs",
  "scripts/run-playwright.mjs",
  "scripts/run-backend-playwright.mjs",
  "scripts/reviewer-evidence-smoke.mjs",
  "playwright.backend.config.mjs",
  "playwright.reviewer.config.mjs",
  "playwright.showcase.config.mjs",
  "e2e/planner-workbench.backend.spec.ts",
  "e2e/reviewer-pack.visual.spec.ts",
  "e2e/ui-library-showcase.spec.ts",
  "e2e/ui-library-showcase.visual.spec.ts"
];

const requiredReadmeText = [
  "synthetic",
  "planner workbench",
  "docs/architecture.md",
  "docs/api-integration.md",
  "docs/containerisation.md",
  "docs/guardrails.md",
  "docs/reviewer-pack.md",
  "docs/reviewer-runbook.md",
  "docs/future-hardening.md",
  "guard:browser-bundle",
  "test:e2e:backend",
  "test:reviewer-pack",
  "test:visual:showcase",
  "apps/planner-workbench/README.md",
  "packages/services/README.md",
  "packages/ui-library/README.md"
];

const requiredRootScripts = [
  "build",
  "guard",
  "container:build",
  "container:run",
  "container:smoke",
  "guard:artifacts",
  "guard:browser-bundle",
  "guard:browser-origins",
  "guard:public-docs",
  "guard:secrets",
  "lint",
  "test",
  "test:links",
  "test:e2e:backend",
  "test:reviewer-pack",
  "test:reviewer-evidence",
  "test:visual:showcase",
  "test:visual:showcase:update",
  "typecheck",
  "verify"
];

const requiredPackageNames = new Map([
  ["apps/planner-workbench/package.json", "@maintenance-planning/planner-workbench"],
  ["packages/services/package.json", "@maintenance-planning/services"],
  ["packages/ui-assets/package.json", "@maintenance-planning/ui-assets"],
  ["packages/ui-library/package.json", "@maintenance-planning/ui-library"],
  ["packages/ui-tokens/package.json", "@maintenance-planning/ui-tokens"],
  ["packages/utils/package.json", "@maintenance-planning/utils"]
]);

const failures = [];

for (const filePath of requiredFiles) {
  if (!existsSync(filePath)) {
    failures.push(`required file is missing: ${filePath}`);
  }
}

if (existsSync("README.md")) {
  const readme = readFileSync("README.md", "utf8");
  for (const expected of requiredReadmeText) {
    if (!readme.includes(expected)) {
      failures.push(`README.md is missing expected reviewer evidence: ${expected}`);
    }
  }
}

if (existsSync("package.json")) {
  const rootManifest = JSON.parse(readFileSync("package.json", "utf8"));
  for (const scriptName of requiredRootScripts) {
    if (!rootManifest.scripts?.[scriptName]) {
      failures.push(`package.json is missing required script: ${scriptName}`);
    }
  }
}

if (existsSync("pnpm-workspace.yaml")) {
  const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
  if (!workspace.includes("apps/*")) {
    failures.push("pnpm-workspace.yaml is missing apps/*");
  }
  if (!workspace.includes("packages/*")) {
    failures.push("pnpm-workspace.yaml is missing packages/*");
  }
}

for (const [manifestPath, packageName] of requiredPackageNames.entries()) {
  if (!existsSync(manifestPath)) continue;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== packageName) {
    failures.push(`${manifestPath} expected package name ${packageName}`);
  }
  if (manifest.private !== true) {
    failures.push(`${manifestPath} must remain private`);
  }
}

for (const filePath of requiredFiles.filter((path) => path.endsWith(".md") && existsSync(path))) {
  const contents = readFileSync(filePath, "utf8");
  for (const target of extractMarkdownLinkTargets(contents)) {
    checkMarkdownLink(filePath, target);
  }
}

if (failures.length > 0) {
  console.error("Reviewer evidence smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Reviewer evidence smoke passed.");
}

function extractMarkdownLinkTargets(contents) {
  const targets = [];
  const markdownLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkPattern.exec(contents)) !== null) {
    const rawTarget = match[1].trim().split(/\s+/)[0];
    targets.push(stripAngleBrackets(rawTarget));
  }

  return targets;
}

function stripAngleBrackets(value) {
  if (value.startsWith("<") && value.endsWith(">")) {
    return value.slice(1, -1);
  }

  return value;
}

function checkMarkdownLink(sourceFilePath, rawTarget) {
  if (rawTarget === "" || rawTarget.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) {
    return;
  }

  const [pathWithoutAnchor] = rawTarget.split("#");
  if (pathWithoutAnchor === "") return;

  let decodedPath = pathWithoutAnchor;
  try {
    decodedPath = decodeURIComponent(pathWithoutAnchor);
  } catch {
    failures.push(`${sourceFilePath} has an invalid encoded Markdown link: ${rawTarget}`);
    return;
  }

  const resolvedPath = normalize(join(dirname(sourceFilePath), decodedPath));

  if (!existsSync(resolvedPath)) {
    failures.push(`${sourceFilePath} links to missing local target: ${rawTarget}`);
    return;
  }

  const stats = statSync(resolvedPath);
  if (!stats.isFile() && !stats.isDirectory()) {
    failures.push(`${sourceFilePath} links to unsupported local target: ${rawTarget}`);
  }
}
