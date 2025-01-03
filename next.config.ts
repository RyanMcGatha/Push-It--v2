import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      // Keep Google auth images explicitly
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // For security, you might want to disallow some domains
    // domains: [], // deprecated in favor of remotePatterns
  },
};

export default nextConfig;
