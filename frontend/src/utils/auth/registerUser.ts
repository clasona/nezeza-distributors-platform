
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

export const registerUserGoogle = async (userData: UserProps) => {
  try {
    const response = await axiosInstance.post('/auth/register/google', userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}