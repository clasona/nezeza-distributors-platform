// utils/axiosInstance.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ErrorResponse } from './types/ErrorResponse'; 


const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Base URL
  withCredentials: true, // Include cookies
//   headers: {
//     'Content-Type': 'application/json',
//   },
});
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.method !== 'get' && config.data) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    let errorMessage = 'An unexpected error occurred.';

      if (error.response) {
        const errorData: ErrorResponse = error.response.data;
      errorMessage = errorData.msg || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;
