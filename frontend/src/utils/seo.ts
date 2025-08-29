interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  canonical?: string;
  structuredData?: any;
}

export const createSEOConfig = ({
  title,
  description,
  keywords = [],
  ogImage = '/images/vesoko-og-default.jpg',
  ogType = 'website',
  noIndex = false,
  canonical,
  structuredData
}: SEOProps) => {
  const siteName = 'VeSoko';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vesoko.com';
  const defaultDescription = 'VeSoko - The premier marketplace for authentic African products. Connect African sellers to global markets with our comprehensive ecommerce platform.';
  const defaultKeywords = [
    'African products',
    'African marketplace', 
    'authentic African goods',
    'African ecommerce',
    'African sellers',
    'African manufacturers',
    'wholesale African products',
    'import African goods',
    'VeSoko',
    'Soko platform'
  ];

  const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - Authentic African Products Marketplace`;
  const seoDescription = description || defaultDescription;
  const seoKeywords = [...defaultKeywords, ...keywords];
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(', '),
    ogTitle: title || siteName,
    ogDescription: seoDescription,
    ogImage: fullOgImage,
    ogType,
    ogUrl: canonicalUrl,
    noIndex,
    canonical: canonicalUrl,
    structuredData
  };
};

export const generateProductStructuredData = (product: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [],
    "brand": {
      "@type": "Brand",
      "name": product.brand || "VeSoko Marketplace"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "VeSoko"
      }
    }
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VeSoko",
    "description": "The premier marketplace for authentic African products, connecting African sellers to global markets.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://vesoko.com",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://vesoko.com"}/images/vesoko-logo.png`,
    "sameAs": [
      // Add your social media URLs here when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@vesoko.com"
    }
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
};
