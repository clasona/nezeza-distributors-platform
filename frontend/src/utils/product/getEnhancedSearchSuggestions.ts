import axiosInstance from '../axiosInstance';
import { ProductProps } from '../../../type';

export interface EnhancedSearchSuggestionsResponse {
  categories: string[];
  popularTags: string[];
  suggestions: string[];
  productNames: string[];
  brands: string[];
  keywords: string[];
}

export const getEnhancedSearchSuggestions = async (): Promise<EnhancedSearchSuggestionsResponse | null> => {
  try {
    // Get products from retailers endpoint to generate comprehensive suggestions
    const response = await axiosInstance.get('/products/retailers');

    if (response.status !== 200 || !response.data?.products) {
      console.log('Retailers products data not fetched for enhanced suggestions.');
      return null;
    }

    const products: ProductProps[] = response.data.products;
    
    // Extract comprehensive suggestions from product data
    const suggestions = generateComprehensiveSuggestions(products);
    
    return suggestions;
    
  } catch (error: any) {
    console.error('Error fetching enhanced search suggestions:', error);
    // Fallback to basic suggestions if enhanced fails
    try {
      const fallbackResponse = await axiosInstance.get('/products/search-suggestions');
      if (fallbackResponse.status === 200) {
        const basicSuggestions = fallbackResponse.data;
        return {
          categories: basicSuggestions.categories || [],
          popularTags: basicSuggestions.popularTags || [],
          suggestions: basicSuggestions.suggestions || [],
          productNames: [],
          brands: [],
          keywords: []
        };
      }
    } catch (fallbackError) {
      console.error('Fallback suggestions also failed:', fallbackError);
    }
    return null;
  }
};

function generateComprehensiveSuggestions(products: ProductProps[]): EnhancedSearchSuggestionsResponse {
  const categories = new Set<string>();
  const tags = new Set<string>();
  const productNames = new Set<string>();
  const brands = new Set<string>();
  const keywords = new Set<string>();
  
  products.forEach(product => {
    // Extract categories
    if (product.category) {
      categories.add(product.category);
      // Also add category as keyword
      keywords.add(product.category);
    }
    
    // Extract tags
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        if (tag && tag.trim()) {
          tags.add(tag.trim());
          keywords.add(tag.trim());
        }
      });
    }
    
    // Extract product titles/names
    if (product.title) {
      productNames.add(product.title);
      
      // Extract individual words from product titles as keywords
      const titleWords = product.title.toLowerCase()
        .split(/[\s\-_,\.]+/) // Split on spaces, dashes, underscores, commas, dots
        .filter(word => word.length > 2) // Only words longer than 2 characters
        .filter(word => !commonStopWords.includes(word)); // Remove common words
      
      titleWords.forEach(word => keywords.add(word));
    }
    
    // Extract brand information from store name (if available)
    if (product.storeId && typeof product.storeId === 'object' && product.storeId.name) {
      brands.add(product.storeId.name);
      keywords.add(product.storeId.name);
    }
    
    // Extract keywords from description
    if (product.description) {
      const descriptionWords = product.description.toLowerCase()
        .split(/[\s\-_,\.;:!?]+/)
        .filter(word => word.length > 3) // Only longer words from description
        .filter(word => !commonStopWords.includes(word))
        .slice(0, 3); // Limit description keywords per product
      
      descriptionWords.forEach(word => keywords.add(word));
    }
    
    // Add color-related keywords if colors exist
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      keywords.add('colored');
      keywords.add('colorful');
      // You could also add specific color names if they're not hex codes
    }
    
    // Add shipping-related keywords
    if (product.freeShipping) {
      keywords.add('free shipping');
    }
    
    // Add availability keywords
    if (product.availability) {
      keywords.add('available');
      keywords.add('in stock');
    }
    
    // Add featured keywords
    if (product.featured) {
      keywords.add('featured');
      keywords.add('popular');
    }
    
    // Add rating-based keywords
    if (product.rating >= 4) {
      keywords.add('highly rated');
      keywords.add('top rated');
    }
  });
  
  // Combine all suggestions and sort by relevance/frequency
  const allSuggestions = new Set([
    ...Array.from(productNames),
    ...Array.from(categories),
    ...Array.from(tags),
    ...Array.from(brands),
    ...Array.from(keywords)
  ]);
  
  // Convert to arrays and sort
  const sortedCategories = Array.from(categories).sort();
  const sortedTags = Array.from(tags).sort();
  const sortedProductNames = Array.from(productNames).sort();
  const sortedBrands = Array.from(brands).sort();
  const sortedKeywords = Array.from(keywords).sort();
  const sortedSuggestions = Array.from(allSuggestions).sort();
  
  return {
    categories: sortedCategories,
    popularTags: sortedTags,
    suggestions: sortedSuggestions,
    productNames: sortedProductNames,
    brands: sortedBrands,
    keywords: sortedKeywords
  };
}

// Common stop words to filter out from keywords
const commonStopWords = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
  'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
];
