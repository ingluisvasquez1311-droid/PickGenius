import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    return [];
  },
};

export default nextConfig;
