import React from 'react';
import axios from 'axios';

import { UserProps } from '../../../type';

export const registerUser = async (userData: UserProps) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/auth/register/`,
      userData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error registering user'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
