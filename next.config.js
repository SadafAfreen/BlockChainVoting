/** @type {import('next').NextConfig} */

// NOTE: @zeit/next-css has been removed — CSS imports are natively
// supported in Next.js 14. 

const nextConfig = {
  reactStrictMode: false,

  experimental: {
    // FIX: In Next.js 14, this lives inside `experimental`.
    // It was only promoted to a top-level key in Next.js 15.
    serverComponentsExternalPackages: ['ethers', 'kubo-rpc-client'],
  },

  webpack: (config, { isServer }) => {
    // Required for ethers.js v6 on Node 20
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        'fs-extra': false,
        path: false,
        stream: false,
        os: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
