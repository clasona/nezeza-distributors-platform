import axiosInstance from '../axiosInstance';

interface ProductFilters {
  searchQuery?: string;
  category?: string;
  filter?: string;
}

export const getRetailersProducts = async (filters?: ProductFilters | string) => {
  try {
    // Handle backward compatibility with string parameter
    let queryParams = '';
    
    if (typeof filters === 'string') {
      // Old API: just search query
      queryParams = filters ? `?search=${encodeURIComponent(filters)}` : '';
    } else if (filters) {
      // New API: object with multiple filters
      const params = new URLSearchParams();
      
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.filter) {
        switch (filters.filter) {
          case 'deals':
            params.append('onSale', 'true');
            break;
          case 'featured':
            params.append('featured', 'true');
            break;
          case 'free_shipping':
            params.append('freeShipping', 'true');
            break;
          case 'new_releases':
            params.append('sortBy', 'newest');
            break;
        }
      }
      
      queryParams = params.toString() ? `?${params.toString()}` : '';
    }

    const response = await axiosInstance.get(`/products/retailers${queryParams}`);

    if (response.status !== 200) {
      console.log('retailers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    console.error('Error fetching retailers products:', error);
    throw error;
  }
};

export const getWholesalersProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/wholesalers');

    if (response.status !== 200) {
      console.log('wholesalers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    throw error;
  }
};


export const getManufacturersProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/manufacturers');

    if (response.status !== 200) {
      console.log('manufacturers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    throw error;
  }
};

