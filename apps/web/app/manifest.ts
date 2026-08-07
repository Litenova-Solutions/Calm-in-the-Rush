import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calm in the Rush',
    short_name: 'Calm in the Rush',
    description: 'A quiet minute in the middle of everything.',
    start_url: '/demo',
    display: 'standalone',
    background_color: '#10252B',
    theme_color: '#10252B',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
