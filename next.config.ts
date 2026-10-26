import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? '.next' : process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  allowedDevOrigins: ['*.run.app', 'localhost:3000', '*.asia-southeast1.run.app'],

  // High-performance image optimization for minimal bandwidth and CDN costs
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache TTL on optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },

  // Security headers to protect against common web vulnerabilities (XSS, clickjacking, MIME sniffing)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
