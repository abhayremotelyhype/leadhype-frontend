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
  async rewrites() {
    // Get backend URL from environment variable with fallback
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5010';

    return [
      {
        source: '/api/docs',
        destination: `${backendUrl}/api/docs/`, // Explicitly add trailing slash for Scalar
      },
      {
        source: '/api/scalar.js',
        destination: `${backendUrl}/api/docs/scalar.js`, // Fix Scalar JS path
      },
      {
        source: '/api/scalar.aspnetcore.js',
        destination: `${backendUrl}/api/docs/scalar.aspnetcore.js`, // Fix Scalar ASP.NET JS path
      },
      {
        source: '/api/docs/:path*',
        destination: `${backendUrl}/api/docs/:path*`, // Proxy Scalar assets
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to backend API
      },
    ];
  },
};

module.exports = nextConfig;