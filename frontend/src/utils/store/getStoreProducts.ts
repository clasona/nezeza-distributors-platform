import axiosInstance from '../axiosInstance';

export const getStoreProducts = async (storeId: string) => {
  try {
    console.log(`Fetching products for store: ${storeId}`);
    const response = await axiosInstance.get(`/store/${storeId}/products`);
    
    if (response.status === 200) {
      console.log(`Store products fetched successfully. Found ${response.data.count} products`);
      return response.data.products || [];
    } else {
      console.log('Store products data not fetched.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching store products data:', error);
    return [];
  }
};
