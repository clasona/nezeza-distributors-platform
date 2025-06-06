import { AddressProps, OrderItemsProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const createPaymentIntent = async (orderItems: OrderItemsProps, shippingAddress: AddressProps) => {
  //   const tax = 10; // TODO: to be changed later
  //   const shippingFee = 20; // TODO: to be changed later
  //   const paymentMethod = 'credit_card';
  try {
    const response = await axiosInstance.post(
      '/payment/create-payment-intent',
      {
        orderItems,
        shippingAddress
      }
    );
    return response; //returns client secret and payment intent
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
