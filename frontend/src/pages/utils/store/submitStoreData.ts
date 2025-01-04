import React from 'react';
import axios from 'axios';

import { StoreProps } from '../../../../type';

export const submitStoreData = async (
  userInfo: any,
  storeData: StoreProps
) => {
  const manufacturerId = userInfo.userId;

  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/store`,
      storeData,
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
      throw new Error('Error submitting store data'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error submitting store data:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
