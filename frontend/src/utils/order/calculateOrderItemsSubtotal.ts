import React from 'react';
import { OrderProps } from '../../../type';

export const calculateOrderItemsSubtotal = (order: OrderProps) => {
  let subtotal = 0;
  const orderItems = order.orderItems;

  for (let i = 0; i < orderItems.length; i++) {
    subtotal += orderItems[i].price * orderItems[i].quantity;
  }
  return subtotal;
};
