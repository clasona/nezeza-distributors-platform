import axios from 'axios';
import { OrderProps } from '../../../type';

export const getMyAllOrders = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/buying`,
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.orders;

    if (response.status !== 200) {
      console.log('all my orders data not fetched.');
      // console.log(ordersData);
    } else {
      console.log('all my orders data fetched successfully...');
      return ordersData;
    }
  } catch (error) {
    console.error('Error fetching all my orders data:', error);
  }
};
