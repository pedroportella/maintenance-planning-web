#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules"]);
const failures = [];

for (const filePath of listMarkdownFiles(root)) {
  const contents = readFileSync(filePath, "utf8");
  for (const target of extractMarkdownLinkTargets(contents)) {
    checkMarkdownLink(filePath, target);
  }
}

if (failures.length > 0) {
  console.error("Markdown link check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Markdown link check passed.");
}

function listMarkdownFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
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
    failures.push(`${relativePath(sourceFilePath)} has an invalid encoded Markdown link: ${rawTarget}`);
    return;
  }

  const resolvedPath = normalize(join(dirname(sourceFilePath), decodedPath));

  if (!existsSync(resolvedPath)) {
    failures.push(`${relativePath(sourceFilePath)} links to missing local target: ${rawTarget}`);
    return;
  }

  const stats = statSync(resolvedPath);
  if (!stats.isFile() && !stats.isDirectory()) {
    failures.push(`${relativePath(sourceFilePath)} links to unsupported local target: ${rawTarget}`);
  }
}

function relativePath(filePath) {
  return relative(root, filePath).replaceAll("\\", "/");
}
