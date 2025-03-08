import React from 'react';
import axios from 'axios';

import { StoreProps, UserProps } from '../../../type';

export const createStoreApplication = async (
  userInfo: UserProps,
  storeApplicationData: StoreProps
) => {
  const ownerId = userInfo._id;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/store-application/${ownerId}/applications/`,
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
