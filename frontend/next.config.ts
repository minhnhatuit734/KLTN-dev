import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Cấu hình nhiều domain
    domains: [
      "localhost",
      "travel-backend.local", 
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
        hostname: "travel-backend.local",
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
