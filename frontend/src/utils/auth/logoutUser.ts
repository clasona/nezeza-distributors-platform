// utils/auth/logoutUser.ts
import axiosInstance from '../axiosInstance';

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.delete('/auth/logout');
    return response;
  } catch (error) {
    console.error('Backend logout error:', error);
    // Don't throw error since frontend logout should continue even if backend fails
    return null; 
  }
};
