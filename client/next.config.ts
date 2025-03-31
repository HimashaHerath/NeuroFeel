/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverRuntimeConfig: {
    API_URL: process.env.API_URL || "http://localhost:8000/wesad/dataserving",
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000/wesad/dataserving",
  },
};

module.exports = nextConfig;
