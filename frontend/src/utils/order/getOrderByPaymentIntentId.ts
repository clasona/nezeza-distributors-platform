import React from 'react';
import axios from 'axios';

import { OrderItemsProps, ProductProps } from '../../../type';
import { handleAxiosError } from '../errorUtils';

export const getOrderByPaymentIntentId = async (paymentIntentId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/orders/buying/payment/${paymentIntentId}`,

      {
        withCredentials: true,
      }
    );

    const ordersData = response.data.order;

    if (response.status !== 200) {
      console.log('order data not fetched.');
      return null;
    } else {
      return ordersData;
    }
  } catch (error: any) {
    console.error('Error fetching order data:', error);
    return handleAxiosError(error); // Use the utility function
  }
};
