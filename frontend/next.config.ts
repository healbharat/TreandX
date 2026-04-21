import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Since we're doing a static export, trailing slashes help with hosting providers
  trailingSlash: true,
};

export default nextConfig;
