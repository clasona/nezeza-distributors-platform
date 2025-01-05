import React from 'react';
import axios from 'axios';

import { StoreProps } from '../../../type';

export const createStoreApplication = async (
  userInfo: any,
  storeApplicationData: StoreProps
) => {
  const ownerId = userInfo.userId;

  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/store-application/${ownerId}/applications/`,
      storeApplicationData,
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
      throw new Error('Error creating store application'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating store application:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
