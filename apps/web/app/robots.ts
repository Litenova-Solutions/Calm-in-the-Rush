import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: ['/', '/demo'], disallow: ['/admin'] }],
    sitemap: 'https://calmintherush.org/sitemap.xml',
  };
}
