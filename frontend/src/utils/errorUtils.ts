// errorUtils.ts

import axios, { AxiosError } from 'axios';

interface ErrorDetails {
  // Define an interface for error details
  code: number | null;
  message: string;
}

export const handleAxiosError = (
  error: any,
  customMessages?: { [key: string]: string }
): ErrorDetails => {
  let errorCode: number | null = null;
  let defaultMessage: string = 'An unexpected error occurred.'; // Default message
  let message: string = defaultMessage; // Initialize with the default

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    errorCode = axiosError.response?.status || null;

    switch (axiosError.response?.status) {
      case 404:
        message = 'Item not found.';
        // errorCode = 'not_found';
        break;
      case 401:
        message = 'You are not authorized to perform this action.';
        // errorCode = 'unauthorized';
        break;
      case 403:
        message = 'You do not have permission to access this resource.';
        // errorCode = 'forbidden';
        break;
      case 500:
        message = 'An internal server error occurred. Please try again later.';
        // errorCode = 'server_error';
        break;
      // ... other status codes
      default:
        message =
          'An error occurred while making the request. Please try again later.';
        // errorCode = 'axios_error';
    }
  } else if (error instanceof TypeError) {
    defaultMessage =
      'A network error occurred. Please check your internet connection.';
    // errorCode = 'network_error';
  } else {
    message = 'An unexpected error occurred.';
    // errorCode = 'other_error';
  }

  message = customMessages?.[errorCode || 'default'] || defaultMessage; 

  return {
    code: errorCode,
    message,
  };
};
