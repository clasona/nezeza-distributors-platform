import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ContentPage {
  _id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  category: 'general' | 'seller' | 'shopper' | 'legal' | 'support';
  published: boolean;
  featured: boolean;
  order: number;
  tags: string[];
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: 'general' | 'seller' | 'shopper' | 'payments' | 'shipping' | 'returns' | 'account' | 'technical';
  subcategory?: string;
  userType: 'all' | 'seller' | 'shopper' | 'wholesaler' | 'retailer' | 'manufacturer';
  published: boolean;
  featured: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  views: number;
  order: number;
  tags: string[];
  relatedArticles?: {
    title: string;
    slug: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Content Pages API
export const getAllContentPages = async (filters?: {
  category?: string;
  featured?: boolean;
  published?: boolean;
  tag?: string;
}): Promise<{ success: boolean; data: ContentPage[]; count: number }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.published !== undefined) params.append('published', filters.published.toString());
    if (filters?.tag) params.append('tag', filters.tag);

    const response = await fetch(`${API_URL}/content/pages?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch pages');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    toast.error(error.message || 'Failed to fetch pages');
    throw error;
  }
};

export const getContentPageBySlug = async (slug: string): Promise<{ success: boolean; data: ContentPage }> => {
  try {
    const response = await fetch(`${API_URL}/content/pages/${slug}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Page not found');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching page:', error);
    toast.error(error.message || 'Failed to fetch page');
    throw error;
  }
};

// FAQ API
export const getAllFAQs = async (filters?: {
  category?: string;
  userType?: string;
  featured?: boolean;
  published?: boolean;
  tag?: string;
}): Promise<{ success: boolean; data: FAQ[]; count: number }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.userType) params.append('userType', filters.userType);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.published !== undefined) params.append('published', filters.published.toString());
    if (filters?.tag) params.append('tag', filters.tag);

    const response = await fetch(`${API_URL}/content/faqs?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch FAQs');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    toast.error(error.message || 'Failed to fetch FAQs');
    throw error;
  }
};

export const getFAQById = async (id: string): Promise<{ success: boolean; data: FAQ }> => {
  try {
    const response = await fetch(`${API_URL}/content/faqs/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'FAQ not found');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching FAQ:', error);
    toast.error(error.message || 'Failed to fetch FAQ');
    throw error;
  }
};

export const markFAQHelpful = async (id: string, helpful: boolean): Promise<{ success: boolean; data: { helpfulCount: number; notHelpfulCount: number } }> => {
  try {
    const response = await fetch(`${API_URL}/content/faqs/${id}/helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ helpful }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark FAQ as helpful');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error marking FAQ as helpful:', error);
    toast.error(error.message || 'Failed to mark FAQ as helpful');
    throw error;
  }
};

export const searchContent = async (query: string, type: 'all' | 'pages' | 'faqs' = 'all'): Promise<{ 
  success: boolean; 
  data: { 
    pages?: ContentPage[]; 
    faqs?: FAQ[]; 
  }; 
  query: string 
}> => {
  try {
    const params = new URLSearchParams();
    params.append('query', query);
    if (type !== 'all') params.append('type', type);

    const response = await fetch(`${API_URL}/content/search?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Search failed');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error searching content:', error);
    toast.error(error.message || 'Search failed');
    throw error;
  }
};
