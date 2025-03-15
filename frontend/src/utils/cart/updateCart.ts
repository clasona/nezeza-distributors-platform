import { OrderItemsProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const updateCart = async (cartItems: OrderItemsProps, buyerStoreId: string) => {
  try {
    const response = await axiosInstance.patch(`/cart`, {
      cartItems: cartItems,
      buyerStoreId: buyerStoreId, // Send buyerStoreId in the request body
    });
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};


