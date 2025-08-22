// utils/axiosInstance.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ErrorResponse } from './types/ErrorResponse'; 
import { getServerUrl } from './getServerUrl';

const BACKEND_URL = getServerUrl() || process.env.NEXT_PUBLIC_BACKEND_URL;
console.log("Using BACKEND_URL:", BACKEND_URL);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`, // Base URL
  withCredentials: true, // Include cookies
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
      const errorData: any = error.response.data;
      // Try different field names that the backend might use
      errorMessage = errorData.error || errorData.message || errorData.msg || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;
