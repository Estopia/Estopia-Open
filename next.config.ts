import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.100",
    "192.168.0.*",
    "192.168.1.*",
    "10.0.0.*",
    "testty.estopia.net",
    "172.16.*",
  ],
};

export default nextConfig;
