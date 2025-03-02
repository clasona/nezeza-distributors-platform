import { OrderProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const getMyUnarchivedOrders = async () => {
   try {
    const response = await axiosInstance.get('/orders/buying');

    if (response.status !== 200) {
      console.log('my orders data not fetched.');
      return null;
    } else {
      const nonArchivedOrders = response.data.orders.filter(
        (order: OrderProps) => order.fulfillmentStatus !== 'Archived'
      );
      return nonArchivedOrders;
    }
  } catch (error: any) {
    throw error;
   }
};
