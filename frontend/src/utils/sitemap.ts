export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const urls = entries.map(entry => {
    return `  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

export const getStaticSitemapEntries = (): SitemapEntry[] => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vesoko.com';
  const currentDate = new Date().toISOString().split('T')[0];

  return [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/buyers/faq`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/buyers/privacy-policy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5
    },
    {
      loc: `${baseUrl}/buyers/terms-conditions`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5
    }
  ];
};
