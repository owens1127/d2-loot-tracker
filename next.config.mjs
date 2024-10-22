/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUNGIE_API_KEY: process.env.BUNGIE_API_KEY,
    RH_API_KEY: process.env.RH_API_KEY,
  },
};

export default nextConfig;
