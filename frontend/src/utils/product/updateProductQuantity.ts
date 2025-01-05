import React from 'react';
import axios from 'axios';

import { ProductProps } from '../../../type';

export const updateProductQuantity = async (
  productId: string,
  updatedProductData: Partial<ProductProps>
) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/v1/products/${productId}`,
      updatedProductData,
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error updating product with id: ${productId}`);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
