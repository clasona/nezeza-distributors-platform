// utils/auth/resetPassword.ts
import axiosInstance from '../axiosInstance';

export const resetPassword = async (token: string, email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error?.response?.data || error;
  }
};
