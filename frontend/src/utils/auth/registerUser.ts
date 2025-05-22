
import { UserProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const registerUser = async (userData: UserProps) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
