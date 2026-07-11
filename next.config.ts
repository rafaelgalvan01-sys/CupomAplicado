import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://cdn.lomadee.com.br/**")],
  },
};

export default nextConfig;
