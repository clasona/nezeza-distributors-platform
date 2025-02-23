import axios from 'axios';
import { useSelector } from 'react-redux';
import { stateProps, StoreProps } from '../../../type';

export const getCart = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/cart`,

      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const cartItemsData = response.data.cartItems;

    if (response.status !== 201) {
        console.log('cart items data not fetched.');
        return null;
    } else {
      console.log('cart items data fetched successfully...', cartItemsData);
      return cartItemsData;
    }
  } catch (error) {
      console.error('Error fetching cart items data:', error);
      return null;
  }
};
