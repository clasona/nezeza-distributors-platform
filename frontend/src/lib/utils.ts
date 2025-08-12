import { getSingleOrder } from '@/utils/order/getSingleOrder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSellerTypeBaseurl = (storeType: string) => {
  const storeTypeMap: Record<string, string> = {
    manufacturing: 'manufacturer',
    wholesale: 'wholesaler',
    retail: 'retailer',
    admin: 'admin',
  };

  return storeTypeMap[storeType] ?? '';
};

export const getOrderStatus = async (orderId: string) => {
  const thisOrder = await getSingleOrder(orderId);
  return thisOrder?.fulfillmentStatus ?? null;
};

export const getOrderFulfillmentStatuses = () => [
  { value: 'pending', label: 'Pending' },
  { value: 'placed', label: 'Placed' },
  { value: 'processing', label: 'Processing' },
  { value: 'partially_fulfilled', label: 'Partially Fulfilled' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'partially_shipped', label: 'Partially Shipped' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'partially_delivered', label: 'Partially Delivered' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'partially_cancelled', label: 'Partially Cancelled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'partially_returned', label: 'Partially Returned' },
  { value: 'returned', label: 'Returned' },
  { value: 'archived', label: 'Archived' },
];
