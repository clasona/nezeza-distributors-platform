import axiosInstance from '../axiosInstance';

export const fetchCustomers = async (storeId: string) => {
  try {
    const response = await axiosInstance.get(`/customers/for/${storeId}`);

    if (response.status !== 200) {
      console.log('Customer data not fetched.');
      return [];
    }

    console.log('Customer data fetched successfully:', response.data);
    
    return response.data.customers || [];
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};
