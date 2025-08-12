import axiosInstance from '../axiosInstance';
import { UserProps } from '../../../type';

export const fetchCustomerById = async (customerId: string): Promise<UserProps | null> => {
  try {
    const response = await axiosInstance.get(`/api/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    return null;
  }
};
