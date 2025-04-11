/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pages/home',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/reset-password',
        destination: '/auth/reset-password',
        permanent: true,
      },
      {
        source: '/create-account',
        destination: '/auth/create-account',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
