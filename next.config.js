// next.config.js
const { NextConfig } = require('next');

module.exports = {
  webpack: (config, { isServer }) => {
    // This will ignore 'child_process' module in the frontend code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index.html',
        permanent: true,
      },
    ];
  },
};
