/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/enquiries",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
