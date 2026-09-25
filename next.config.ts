import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3001",
        "arwpce.name.ng",
        "www.arwpce.name.ng", // include if www resolves too
      ],
    },
  },
};

export default nextConfig;
