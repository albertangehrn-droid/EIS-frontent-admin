const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/EIS/admin';
const normalizedBasePath = basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`).replace(/\/+$/, '') : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  skipTrailingSlashRedirect: true,

  async redirects() {
    return [
      {
        source: '/',
        destination: normalizedBasePath || '/EIS/admin',
        basePath: false,
        permanent: false,
      },
      {
        source: '/admin',
        destination: normalizedBasePath || '/EIS/admin',
        basePath: false,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${normalizedBasePath || '/EIS/admin'}/:path*`,
        basePath: false,
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/Images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      // 👇 specific domain (recommended for security)
      {
        protocol: "http",
        hostname: "dev.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "demo.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "demo.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "backend.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "backend.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "demobackend.alphasim.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "demobackend.alphasim.cloud",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
};

export default nextConfig;
