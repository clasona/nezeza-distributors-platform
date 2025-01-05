import axios from 'axios';
import { OrderProps } from '../../../type';

export const getMyArchivedOrders = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/orders/buying',
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.orders;
    // Filter the orders here:
    const archivedOrders = ordersData.filter(
      (order: OrderProps) => order.fulfillmentStatus === 'Archived'
    );

    if (response.status !== 200) {
      console.log('my archived orders data not fetched.');
      return null;
    } else {
      console.log('my archived orders data fetched successfully...');
      return archivedOrders;
    }
  } catch (error) {
    console.error('Error fetching my archived orders data:', error);
      return null;
  }
};
