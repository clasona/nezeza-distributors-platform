import React from 'react';
import axios from 'axios';

import { UserProps } from '../../../type';

export const createStripeAccount = async (email:string) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/payment/create-stripe-connect-account/`,
      {email},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error creating stripe account'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating stripe account:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
