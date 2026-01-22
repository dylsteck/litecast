/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@litecast/config', '@litecast/hooks', '@litecast/types', '@litecast/utils'],
};

module.exports = nextConfig;
