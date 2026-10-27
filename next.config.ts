import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['mupdf'],
  webpack: (config, { dev, isServer }) => {
    // Prevent webpack from writing the persistent filesystem cache
    // (.next/cache/webpack/*.pack, ~285 MiB) which exceeds Cloudflare Pages' 25 MiB
    // per-file asset limit. Memory cache is used instead (no disk writes).
    if (!dev) {
      config.cache = { type: "memory" };
    }

    // Handle mupdf module which uses Node.js built-ins (fs, module)
    // These should only be used client-side in the browser via WebAssembly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      canvas: false,
    };

    // Exclude mupdf from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('mupdf');
    }

    // Exclude mupdf from client-side bundle entirely - it will be loaded dynamically
    // at runtime via import() in the browser. This prevents webpack from trying to
    // process the ESM module with Node.js built-ins.
    config.resolve.alias = {
      ...config.resolve.alias,
      'mupdf': false,
    };

    return config;
  },
};

export default nextConfig;
