/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@edusage/ui", "@edusage/core"],
  images: {
    domains: ['i.ytimg.com'], // Allow YouTube thumbnails
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;