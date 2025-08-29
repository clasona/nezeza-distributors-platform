import { NextApiRequest, NextApiResponse } from 'next';
import { generateSitemapXML, getStaticSitemapEntries } from '@/utils/sitemap';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get static pages
    const staticEntries = getStaticSitemapEntries();
    
    // TODO: Add dynamic product pages here when products are available
    // const productEntries = await getProductSitemapEntries();
    
    const allEntries = [...staticEntries];
    
    const sitemap = generateSitemapXML(allEntries);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ message: 'Error generating sitemap' });
  }
}
