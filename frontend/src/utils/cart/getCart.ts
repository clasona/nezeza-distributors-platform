import axiosInstance from '../axiosInstance'; 
import { ErrorResponse } from '../types/ErrorResponse';

export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart');
    const cartItemsData = response.data.cartItems;

    if (response.status !== 201) {
      console.log('cart items data not fetched.');
      return null;
    } else {
      return cartItemsData;
    }
  } catch (error: any) {
    throw error;
    // console.error('Error fetching cart items data:', error);
    // if (typeof error === 'string') {
    //   console.error(error);
    // } else if (
    //   error &&
    //   typeof error === 'object' &&
    //   'response' in error &&
    //   error.response &&
    //   'data' in error.response
    // ) {
    //   const errorData = error.response.data as ErrorResponse;
    //   console.error(errorData.msg || 'An error occured');
    // } else {
    //   console.error('An unexpected error occured');
    // }
    // return null;
  }
};