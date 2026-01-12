/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Keep trailing slashes for consistent routing
  // trailingSlash: false,
  // Add webpack configuration to prevent chunk loading issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure stable chunk naming in development
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    return config;
  },
};

module.exports = nextConfig;