import React from 'react';
import axios from 'axios';

import { OrderItemsProps, ProductProps } from '../../../type';

export const createOrder = async (orderItems: OrderItemsProps) => {
  // const tax = 0.1 * orderProductsData.amount;
  const taxCharged = 10;
  const shippingFeeCharged = 20;
  const orderData = {
    tax: taxCharged,
    shippingFee: shippingFeeCharged,
    paymentMethod: 'credit_card',
    items: orderItems,
  };
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/orders`,
      orderData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      console.log('Order created successfully:', response.data);
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error creating order'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
