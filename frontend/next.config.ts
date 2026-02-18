import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      // S3 전환 시 추가
      // { protocol: 'https', hostname: '*.s3.ap-northeast-2.amazonaws.com' },
    ],
  },
};

export default nextConfig;
