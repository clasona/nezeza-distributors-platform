
import axiosInstance from '../axiosInstance';

export const getUser = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    const userData = response.data.user;

    if (response.status !== 200) {
      console.log('user data not fetched.');
      return null;
    } else {
      return userData;
    }
  } catch (error: any) {
    throw error;
  }
};

