import { AddressProps, OrderItemsProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const createShipping = async (cartItems: OrderItemsProps, customerAddress: AddressProps) => {
  try {
    const response = await axiosInstance.post(
      '/shipping/shipments/',
      {
        cartItems, customerAddress
      }
    );

    // console.log('Shipment created successfully:', response.data);

    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error('Error creating shipment'); 
    }
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
