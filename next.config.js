const { NextConfig } = require('next');

module.exports = {
  webpack: (config, { isServer }) => {
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
        has: [
          {
            type: 'query',
            key: 'status',
            value: 'Success!',
          },
        ],
        destination: '/home', // Redirect to your custom confirmation page
        permanent: false,
      },
      {
        source: '/',
        destination: '/index.html', // This may be problematic if not intended
        permanent: true,
      },
    ];
  },
};
