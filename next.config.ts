import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint flat config with next-core-web-vitals is not iterable in Next.js 15.
    // We run tsc separately for type safety.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
