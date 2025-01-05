import React from 'react';
import axios from 'axios';

import { NewStoreProps, StoreProps } from '../../../type';

export const createStore = async (storeData: NewStoreProps) => {
  console.log(storeData);
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/store/`,
      storeData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      console.log('Store created successfully');
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error creating store'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating store:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
