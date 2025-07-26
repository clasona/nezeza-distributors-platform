// utils/auth/forgotPassword.ts
import axiosInstance from '../axiosInstance';

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending forgot password email:', error);
    throw error?.response?.data || error;
  }
};
