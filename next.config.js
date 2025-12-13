/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for large file uploads
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Set max body size for API routes (50MB)
  serverRuntimeConfig: {
    maxBodySize: "50mb",
  },
  // Add headers for file uploads
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  // Configure body parser for uploads
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

module.exports = nextConfig;
