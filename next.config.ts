import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
  },
  allowedDevOrigins: ['172.20.10.9']
};

export default nextConfig;
