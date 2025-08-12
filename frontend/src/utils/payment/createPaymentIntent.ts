import { AddressProps, OrderItemsProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const createPaymentIntent = async (
  orderItems: OrderItemsProps, 
  shippingAddress: AddressProps, 
  selectedShippingOptions: { [groupId: string]: string }, 
  shippingTotal: number
) => {
  try {
    const response = await axiosInstance.post(
      '/payment/create-payment-intent',
      {
        orderItems,
        shippingAddress,
        selectedShippingOptions,
        shippingTotal
      }
    );
    return response; //returns client secret and payment intent
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
