import React from 'react';
import axios from 'axios';

import { ProductProps } from '../../../type';

export const createProduct = async (
  productData: ProductProps
) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/products`,
      productData,
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
      throw new Error('Error creating product'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating product:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
