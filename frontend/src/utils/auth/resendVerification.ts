// utils/auth/resendVerificationEmail.ts
import axiosInstance from '../axiosInstance'; // Adjust import path

export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/resend-verification', {
      email,
    });
    return response.data; // Assuming your backend returns a success message
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};
