import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;
