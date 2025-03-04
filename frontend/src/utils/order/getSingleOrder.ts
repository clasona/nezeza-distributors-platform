import axios from 'axios';

export const getSingleOrder = async (id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders/buying/${id}`,
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.order;

    if (response.status !== 200) {
      console.log('order data not fetched.');
      return null;
    } else {
      console.log('order data fetched successfully...');
      return ordersData;
    }
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
};
