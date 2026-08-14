import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calmintherush.org';
  return ['/', '/demo'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date('2026-01-01'),
  }));
}
