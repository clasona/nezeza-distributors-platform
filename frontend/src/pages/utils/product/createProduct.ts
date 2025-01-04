import React from 'react';
import axios from 'axios';

import { ProductProps } from '../../../../type';

export const createProduct = async (
  userInfo: any,
  productData: ProductProps
) => {
  const manufacturerId = userInfo.userId;

  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/manufacturers/${manufacturerId}/products`,
      //   'http://localhost:8000/api/v1/wholesaler/inventory-items', //for other sellers
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
