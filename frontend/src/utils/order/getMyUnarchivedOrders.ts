import axios from 'axios';
import { OrderProps } from '../../../type';

export const getMyUnarchivedOrders = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/orders/buying',
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.orders;

    // Filter the orders here:
    const nonArchivedOrders = ordersData.filter(
      (order: OrderProps) => order.fulfillmentStatus !== 'Archived'
    );

    if (response.status !== 200) {
      console.log('my orders data not fetched.');
      // console.log(ordersData);
    } else {
      console.log('my orders data fetched successfully...');
      // console.log(ordersData);
      return nonArchivedOrders;
    }
  } catch (error) {
    console.error('Error fetching my orders data:', error);
  }
};
