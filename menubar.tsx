import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://cedar.market';
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/delivery-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/return-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabaseServer.from('products').select('slug, updated_at').eq('is_active', true),
      supabaseServer.from('categories').select('slug, created_at').eq('is_active', true),
    ]);

    productRoutes = (products ?? []).map((p: any) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: new Date(p.updated_at ?? new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    categoryRoutes = (categories ?? []).map((c: any) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: new Date(c.created_at ?? new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // If DB unavailable, return static routes only
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
