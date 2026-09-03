import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev }) => {
    // Prevent webpack from writing the persistent filesystem cache
    // (.next/cache/webpack/*.pack, ~285 MiB) which exceeds Cloudflare Pages' 25 MiB
    // per-file asset limit. Memory cache is used instead (no disk writes).
    if (!dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
