// errorUtils.ts

import axios, { AxiosError } from 'axios';
import { ErrorResponse } from './types/ErrorResponse';

interface ErrorDetails {
  // Define an interface for error details
  code: number | null;
  message: string;
}

export const handleError = (error: any) =>{
      console.error('Error:', error);
  if (typeof error === 'string') {
      console.error(error);
    } else if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      'data' in error.response
    ) {
      const errorData = error.response.data as ErrorResponse;
      console.error(errorData.msg || 'An error occured');
    } else {
      console.error('An unexpected error occured');
    }
}

