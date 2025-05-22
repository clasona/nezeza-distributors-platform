import axiosInstance from '../axiosInstance'; // Import your Axios instance

export const verifyEmail = async (email: string, verificationToken: string) => {
  try {
    const response = await axiosInstance.post(
      `/auth/verify-email`,
      {
        email,
        verificationToken,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};
