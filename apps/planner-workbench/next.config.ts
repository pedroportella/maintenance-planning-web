import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@maintenance-planning/services",
    "@maintenance-planning/ui-library",
    "@maintenance-planning/ui-tokens",
    "@maintenance-planning/utils"
  ]
};

export default nextConfig;
