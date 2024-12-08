// utils/orderUtils.ts

import { OrderProps } from '../../../type';

export const calculateOrderStats = (existingOrders: OrderProps[]) => {
  return [
    {
      status: 'All Orders',
      count: existingOrders.length,
      className: 'bg-gray-600',
    },
    {
      status: 'Pending',
      count: existingOrders.filter(
        (order) => order.fulfillmentStatus === 'Pending'
      ).length,
      className: 'bg-yellow-600',
    },
    {
      status: 'Fulfilled',
      count: existingOrders.filter(
        (order) => order.fulfillmentStatus === 'Fulfilled'
      ).length,
      className: 'bg-purple-600',
    },
    {
      status: 'Shipped',
      count: existingOrders.filter(
        (order) => order.fulfillmentStatus === 'Shipped'
      ).length,
      className: 'bg-blue-600',
    },
    {
      status: 'Delivered',
      count: existingOrders.filter(
        (order) => order.fulfillmentStatus === 'Delivered'
      ).length,
      className: 'bg-teal-600',
    },
    {
      status: 'Completed',
      count: existingOrders.filter(
        (order) => order.fulfillmentStatus === 'Complete'
      ).length,
      className: 'bg-green-600',
    },
  ];
};
