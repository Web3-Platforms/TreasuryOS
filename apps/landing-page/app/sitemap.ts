import { MetadataRoute } from 'next';
import { companySummaries, productSummaries } from '@/lib/marketing-content';
import { siteUrl } from '@/lib/site-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const productRoutes = productSummaries.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const companyRoutes = companySummaries.map((page) => ({
    url: `${siteUrl}/company/${page.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/company`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  return [...staticRoutes, ...productRoutes, ...companyRoutes];
}
