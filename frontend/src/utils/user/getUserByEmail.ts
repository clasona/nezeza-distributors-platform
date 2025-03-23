import axiosInstance from '../axiosInstance';

export const getUserByEmail = async (email: string) => {
  try {
    const response = await axiosInstance.get(`/users/by/${email}`);
    const userData = response.data.user;

    if (response.status !== 200) {
      console.log('user by email data not fetched.');
      return null;
    } else {
      return userData;
    }
  } catch (error: any) {
    throw error;
  }
};
