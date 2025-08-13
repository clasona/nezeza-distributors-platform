import axiosInstance from '../axiosInstance';
import { handleError } from '../errorUtils';

export const updateStore = async (storeId: string, updatedFields: any) => {
  try {
    const response = await axiosInstance.patch(`/store/${storeId}`, updatedFields);
    
    if (response.status === 200) {
      return response.data.store;
    } else {
      console.warn('Failed to update store:', response.data);
      throw new Error('Failed to update store information');
    }
  } catch (error: any) {
    console.error('Error updating store:', error);
    handleError(error);
    throw error;
  }
};
