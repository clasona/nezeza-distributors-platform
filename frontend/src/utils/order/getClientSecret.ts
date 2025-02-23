import React from 'react';
import axios from 'axios';

import { OrderItemsProps, ProductProps } from '../../../type';

export const getClientSecret = async (orderItems: any) => {
  // export const getClientSecret = async (orderItems: OrderItemsProps) => {
  const tax = 10; // to be changed later
  const shippingFee = 20; // to be changed later
  const paymentMethod = 'credit_card';
  const items = orderItems;
  // const orderData = {
  //   tax: taxCharged,
  //   shippingFee: shippingFeeCharged,
  //   items: orderItems,
  // };
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/orders`,
      {
        items: orderItems,
        tax: tax,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      console.log('Client secret generated successfully...');
      return response.data;
    } else {
      throw new Error('Error generating client secret'); 
    }
  } catch (error) {
    console.error('Error generating client secret:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
