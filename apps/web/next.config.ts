import path from 'node:path';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: [
    '@calm/content',
    '@calm/experience',
    '@calm/ui',
    'react-native-paper',
    'react-native-safe-area-context',
  ],
  experimental: {
    externalDir: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'lucide-react-native$': 'lucide-react',
      '@react-native-vector-icons/material-design-icons$': false,
      '@expo/vector-icons/MaterialCommunityIcons$': false,
      'react-native-vector-icons/MaterialCommunityIcons$': false,
      'react-native-safe-area-context$': path.resolve(
        __dirname,
        '../../packages/ui/src/safe-area-context.web.tsx',
      ),
    };
    return config;
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
