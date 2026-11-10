import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calm in the Rush',
    short_name: 'Calm in the Rush',
    description: 'A quiet minute in the middle of everything.',
    start_url: '/',
    display: 'standalone',
    background_color: '#e6edc9',
    theme_color: '#e6edc9',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
