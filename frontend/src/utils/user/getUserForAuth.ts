import axiosInstance from '../axiosInstance';

export const getUserForAuth = async (email: string) => {
  try {
    const response = await axiosInstance.get(`/auth/user-for-auth/${email}`);
    const userData = response;

    if (response.status !== 200) {
      console.log('user for auth data not fetched.');
      return null;
    } else {
      return userData;
    }
  } catch (error: any) {
    throw error;
  }
};
