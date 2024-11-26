import axios from 'axios';

export const fetchOrders = async () => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/orders/selling',
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.orders;

    console.log(response);

    if (response.status !== 200) {
      console.log('orders data not fetched.');
      // console.log(ordersData);
    } else {
      console.log('orders data fetched successfully...');
      // console.log(ordersData);
      return ordersData;
      // return { props: { ordersData } };
    }
  } catch (error) {
    console.error('Error fetching orders data:', error);
  }
};
