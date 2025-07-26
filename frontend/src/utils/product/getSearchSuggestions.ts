import axiosInstance from '../axiosInstance';

export interface SearchSuggestionsResponse {
  categories: string[];
  popularTags: string[];
  suggestions: string[];
}

export const getSearchSuggestions = async (): Promise<SearchSuggestionsResponse | null> => {
  try {
    const response = await axiosInstance.get('/products/search-suggestions');

    if (response.status !== 200) {
      console.log('Search suggestions data not fetched.');
      return null;
    } else {
      return response.data;
    }
  } catch (error: any) {
    console.error('Error fetching search suggestions:', error);
    throw error;
  }
};
