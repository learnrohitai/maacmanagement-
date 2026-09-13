import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Faster production builds & smaller client bundles:
  // - tree-shake icon imports instead of bundling the whole icon set
  // - lighten the recharts bundle by importing only used modules
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "date-fns"],
  },
};

export default nextConfig;
