// utils/login.ts
import axiosInstance from '../axiosInstance';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};


export const loginUserGoogle = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/login/google', {
      email,
    });
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
}