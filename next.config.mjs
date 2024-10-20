/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUNGIE_API_KEY: process.env.BUNGIE_API_KEY,
  },
};

export default nextConfig;
