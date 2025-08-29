const fs = require('fs');
const path = require('path');

// Your site's base URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vesoko.com';

// Static pages that should be included in sitemap
const STATIC_PAGES = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    url: '/buyers/faq',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    url: '/buyers/privacy-policy',
    changefreq: 'yearly',
    priority: 0.5
  },
  {
    url: '/buyers/terms-conditions',
    changefreq: 'yearly',
    priority: 0.5
  },
  {
    url: '/coming-soon',
    changefreq: 'weekly',
    priority: 0.6
  }
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const staticUrls = STATIC_PAGES.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  // TODO: Add dynamic product URLs here when you have products
  // const productUrls = products.map(product => `  <url>
  //   <loc>${SITE_URL}/products/${product.slug}</loc>
  //   <lastmod>${product.updatedAt}</lastmod>
  //   <changefreq>weekly</changefreq>
  //   <priority>0.6</priority>
  // </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📍 Located at: ${path.join(publicDir, 'sitemap.xml')}`);
  console.log(`🌐 Accessible at: ${SITE_URL}/sitemap.xml`);
}

// Run the generator
generateSitemap();
