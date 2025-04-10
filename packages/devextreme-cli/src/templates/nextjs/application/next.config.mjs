/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pages/home',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
