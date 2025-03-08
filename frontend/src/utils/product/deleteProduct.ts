import React from 'react';
import axios from 'axios';

import { ProductProps } from '../../../type';

export const deleteProduct = async (productId: string | number) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${productId}`,
      //   '${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/wholesaler/inventory-items', //for other sellers
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error deleting product with id: ${productId}`);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
