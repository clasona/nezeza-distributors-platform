import axiosInstance from '../axiosInstance'; // Import your Axios instance

export const checkUserVerified = async (email: string) => {
  try {
    const response = await axiosInstance.get(
      `/auth/verify/status?email=${email}`
    );
    return response.data.verified;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};
