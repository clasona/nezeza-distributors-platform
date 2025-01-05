import axios from 'axios';
import { useSelector } from 'react-redux';
import { OrderItemsProps, stateProps, StoreProps } from '../../../type';

interface updateCartProps{
    cartItems: OrderItemsProps;
    buyerStoreId: string; // Add buyerStoreId to the request body
}
export const updateCart = async (cartItems: OrderItemsProps, buyerStoreId:string) => {
  // Add buyerStoreId
  try {
    const response = await axios.patch(
      // Use PATCH for updates
      `http://localhost:8000/api/v1/cart`,
      {
        cartItems: cartItems,
        buyerStoreId: buyerStoreId, // Send buyerStoreId in the request body
      },
      {
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      console.error('Cart not updated. Status:', response.status);
    } else {
      console.log('Cart updated successfully...');
    }
    return response.data; // Return the updated cart data
  } catch (error) {
    console.error('Error updating cart:', error);
    return null; // Or throw the error if you want to handle it in the calling function
  }
};
