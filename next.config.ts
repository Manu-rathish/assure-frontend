import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@dummy-data": "./Data.json",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@dummy-data": path.resolve(__dirname, "Data.json"),
    };
    return config;
  },
};

export default nextConfig;
