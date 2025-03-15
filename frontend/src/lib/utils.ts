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
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'partially_fulfilled', label: 'Partially Fulfilled' },
  { value: 'canceled_partially', label: 'Canceled Partially' },
  { value: 'archived', label: 'Archived' },
];
