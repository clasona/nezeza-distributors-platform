import axiosInstance from '../axiosInstance';

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
  }
};