import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
  },
  allowedDevOrigins: ['192.168.0.103']
};

export default nextConfig;
