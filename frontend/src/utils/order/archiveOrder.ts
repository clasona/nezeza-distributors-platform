import axiosInstance from '../axiosInstance';
import { OrderProps } from '../../../type';

export const archiveOrder = async (
  orderId: string,
  updatedOrderData: Partial<OrderProps>
) => {
  try {
    const response = await axiosInstance.patch(
      `orders/buying/archive/${orderId}`,
      updatedOrderData
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error archiving order with id: ${orderId}`);
    }
  } catch (error) {
    console.error('Error archiving order:', error);
    throw error;
  }
};
