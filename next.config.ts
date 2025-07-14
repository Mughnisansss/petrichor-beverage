import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/kasir',
        destination: '/kasir/orderan',
        permanent: true,
      },
      {
        source: '/pengaturan',
        destination: '/pengaturan/profil',
        permanent: true,
      },
       // Redirects for moved pages
      {
        source: '/laporan',
        destination: '/analisa',
        permanent: true,
      },
      {
        source: '/minuman',
        destination: '/racik/minuman',
        permanent: true,
      },
      {
        source: '/penjualan',
        destination: '/kasir/log',
        permanent: true,
      },
      {
        source: '/operasional',
        destination: '/analisa',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
