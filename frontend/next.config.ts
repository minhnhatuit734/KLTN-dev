import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Cấu hình nhiều domain
    domains: [
      "localhost",
      "localhost:4000", 
      "example.com" // Bạn có thể thêm nhiều domain khác
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",  // Cổng cho domain đầu tiên
      },
      {
        protocol: "http",
        hostname: "localhost:4000",
        port: "80", 
      },
      {
        protocol: "http",
        hostname: "example.com",
        port: "8080", 
      },
    ],
  },
};

export default nextConfig;
