import React from 'react';
import axios from 'axios';

import { OrderItemsProps, OrderProps } from '../../../type';

export const updateOrderItem = async (
  orderId: string,
  orderItemId: string,
  updatedOrderItemsData: Partial<OrderItemsProps>
) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/api/v1/orders/${orderId}/${orderItemId}`,
      updatedOrderItemsData,
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error updating order item with id: ${orderItemId}`);
    }
  } catch (error) {
    console.error('Error updating order item:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
