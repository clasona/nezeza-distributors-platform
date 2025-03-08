import React from 'react';
import axios from 'axios';

import { OrderProps } from '../../../type';

export const archiveOrder = async (
  orderId: string,
  updatedOrderData: Partial<OrderProps>
) => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/buying/archive/${orderId}`,
      updatedOrderData,
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error archiving order with id: ${orderId}`);
    }
  } catch (error) {
    console.error('Error archiving order:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
