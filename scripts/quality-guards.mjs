#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const mode = process.argv[2] ?? "all";
const root = process.cwd();

const allowedEnvFiles = new Set([".env.example", ".env.local.example"]);
const ignoredDirectories = new Set([".git", "node_modules"]);

const generatedPathRules = [
  { label: "build output", pattern: /(^|\/)(\.next|\.turbo|dist|build|out)(\/|$)/ },
  { label: "coverage output", pattern: /(^|\/)(coverage|test-results|playwright-report)(\/|$)/ },
  { label: "TypeScript build info", pattern: /\.tsbuildinfo$/i },
  { label: "local cloud config", pattern: /(^|\/)\.aws(\/|$)/ },
  { label: "log file", pattern: /\.log$/i }
];

const employerBrandPattern = new RegExp("\\bB" + "HP\\b", "i");
const industrySpecificPattern = new RegExp("\\bmin" + "ing\\b", "i");
const vendorSpecificSourcePattern = new RegExp("\\bS" + "AP\\b|\\bs" + "ap-work-orders\\b", "i");
const oldWebAppPattern = new RegExp("\\breviewer-" + "console\\b", "i");
const unsupportedServiceClaimPattern = new RegExp(
  "\\bproduction\\s+support\\b|\\bformal\\s+assurance\\b|\\bhigh\\s+availability\\b|\\breal\\s+source-system\\s+connectivity\\b",
  "i"
);

const publicDocForbiddenPatterns = [
  { label: "private workspace notes path", pattern: /ai-notes\//i },
  { label: "private stage label", pattern: /\b[A-Z]\d{1,3}\b/ },
  { label: "employer branding", pattern: employerBrandPattern },
  { label: "industry-specific wording", pattern: industrySpecificPattern },
  { label: "vendor-specific source-system wording", pattern: vendorSpecificSourcePattern },
  { label: "old web app name", pattern: oldWebAppPattern },
  { label: "unsupported service claim", pattern: unsupportedServiceClaimPattern },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "AWS account ARN", pattern: /arn:aws:iam::\d{12}:/ },
  { label: "local env file path", pattern: /(^|[`'\s])\.env(?!\.example\b|\.local(?:\.example)?\b)\b/ },
  { label: "merge conflict marker", pattern: /^(<<<<<<<|=======|>>>>>>>)$/m }
];

const secretPatterns = [
  { label: "connection string with password", pattern: /(Server|Host)=.*;(Password|Pwd)=/i },
  { label: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { label: "JWT secret", pattern: /(jwt|token|client)[_-]?secret\s*[:=]/i },
  { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ }
];

const browserVisibleExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".mjs",
  ".ts",
  ".tsx"
]);

const privateBackendOriginPatterns = [
  { label: "local workstation origin", pattern: new RegExp("https?:\\/\\/(?:local" + "host|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(?::\\d+)?", "i") },
  { label: "container host origin", pattern: new RegExp("https?:\\/\\/host\\.docker\\.internal(?::\\d+)?", "i") },
  { label: "private network origin", pattern: /https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?/i },
  { label: "internal hostname origin", pattern: /https?:\/\/[a-z0-9.-]+\.internal(?::\d+)?/i }
];

function listFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (stats.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function listGitCandidateFiles() {
  try {
    const output = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    return output
      .split("\n")
      .filter(Boolean)
      .map((path) => join(root, path));
  } catch {
    return listFiles(root);
  }
}

function relativePath(filePath) {
  return relative(root, filePath).replaceAll("\\", "/");
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function checkArtifacts() {
  const failures = [];

  for (const filePath of listGitCandidateFiles()) {
    const rel = relativePath(filePath);
    const fileName = rel.split("/").at(-1);

    if (fileName?.startsWith(".env") && !allowedEnvFiles.has(fileName)) {
      failures.push(`${rel} (local environment file)`);
      continue;
    }

    for (const rule of generatedPathRules) {
      if (rule.pattern.test(rel)) {
        failures.push(`${rel} (${rule.label})`);
      }
    }
  }

  report("Artefact guard", failures);
}

function checkPublicDocs() {
  const publicDocs = listFiles(root).filter((filePath) => {
    const rel = relativePath(filePath);
    return rel === "README.md" || rel === "AGENTS.md" || rel === ".cursorrules" || rel.endsWith("/README.md") || (rel.startsWith("docs/") && rel.endsWith(".md"));
  });
  const failures = [];

  for (const filePath of publicDocs) {
    const rel = relativePath(filePath);
    const contents = readText(filePath);

    for (const forbidden of publicDocForbiddenPatterns) {
      if (rel === "AGENTS.md" && forbidden.label === "private workspace notes path") {
        continue;
      }

      if (forbidden.pattern.test(contents)) {
        failures.push(`${rel} contains ${forbidden.label}`);
      }
    }
  }

  report("Public doc leakage guard", failures);
}

function checkSecrets() {
  const failures = [];

  for (const filePath of listGitCandidateFiles()) {
    const rel = relativePath(filePath);
    if (rel.startsWith(".git/")) continue;

    let contents;
    try {
      contents = readText(filePath);
    } catch {
      continue;
    }

    for (const secret of secretPatterns) {
      if (secret.pattern.test(contents)) {
        failures.push(`${rel} contains ${secret.label}`);
      }
    }
  }

  report("Secret guard", failures);
}

function checkBrowserOrigins() {
  const failures = [];

  for (const filePath of listGitCandidateFiles()) {
    const rel = relativePath(filePath);
    if (!isBrowserVisibleCandidate(rel)) continue;

    let contents;
    try {
      contents = readText(filePath);
    } catch {
      continue;
    }

    for (const origin of privateBackendOriginPatterns) {
      if (origin.pattern.test(contents)) {
        failures.push(`${rel} contains ${origin.label}`);
      }
    }
  }

  report("Browser-visible backend origin guard", failures);
}

function isBrowserVisibleCandidate(rel) {
  if (!rel.startsWith("apps/") && !rel.startsWith("packages/")) return false;
  const extension = rel.includes(".") ? `.${rel.split(".").at(-1)}` : "";
  return browserVisibleExtensions.has(extension);
}

function report(label, failures) {
  if (failures.length === 0) {
    console.log(`${label} passed.`);
    return;
  }

  console.error(`${label} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}

const checks = {
  artifacts: checkArtifacts,
  "browser-origins": checkBrowserOrigins,
  "public-docs": checkPublicDocs,
  secrets: checkSecrets,
  all: () => {
    checkArtifacts();
    if (process.exitCode) return;
    checkPublicDocs();
    if (process.exitCode) return;
    checkSecrets();
    if (process.exitCode) return;
    checkBrowserOrigins();
  }
};

if (!checks[mode]) {
  console.error(`Unknown quality guard mode: ${mode}`);
  console.error(`Expected one of: ${Object.keys(checks).join(", ")}`);
  process.exit(1);
}

checks[mode]();
