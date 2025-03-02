import { OrderProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const getMyArchivedOrders = async () => {
  try {
    const response = await axiosInstance.get('/orders/buying');

    if (response.status !== 200) {
      console.log('my archived orders data not fetched.');
      return null;
    } else {
      const archivedOrders = response.data.orders.filter(
        (order: OrderProps) => order.fulfillmentStatus === 'Archived'
      );
      return archivedOrders;
    }
  } catch (error: any) {
    throw error;
  }
};
