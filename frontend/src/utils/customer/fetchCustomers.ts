import axiosInstance from '../axiosInstance';

export const fetchCustomers = async () => {
  try {
    const response = await axiosInstance.get('/users/customers');

    if (response.status !== 200) {
      console.log('Customer data not fetched.');
      return [];
    }
    
    return response.data.customers || [];
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};
