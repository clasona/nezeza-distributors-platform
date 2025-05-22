import axiosInstance from '../axiosInstance';

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/me');
    const userData = response.data.user;

    if (response.status !== 200) {
      console.log('current user data not fetched.');
      return null;
    } else {
      return userData;
    }
  } catch (error: any) {
    throw error;
  }
};
