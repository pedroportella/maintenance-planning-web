import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(appDirectory, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: [
    "@maintenance-planning/services",
    "@maintenance-planning/ui-library",
    "@maintenance-planning/ui-tokens",
    "@maintenance-planning/utils"
  ]
};

export default nextConfig;
