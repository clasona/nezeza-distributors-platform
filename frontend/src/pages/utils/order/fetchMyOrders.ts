import axios from 'axios';

export const fetchMyOrders = async (status?: string) => {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/v1/orders/buying',
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const ordersData = response.data.orders;

    console.log(response);

    if (response.status !== 200) {
      console.log('my orders data not fetched.');
      // console.log(ordersData);
    } else {
      console.log('my orders data fetched successfully...');
      // console.log(ordersData);
      return ordersData;

      // const validStatuses = [
      //   'Pending',
      //   'Fulfilled',
      //   'Shipped',
      //   'Delivered',
      //   'Complete',
      // ];
      // if (status && !validStatuses.includes(status)) {
      //   throw new Error(`Invalid status: ${status}`);
      // }

      // // If a status is provided, filter the orders by fulfillmentStatus
      // const filteredOrders = status
      //   ? ordersData.filter(
      //       (order: { fulfillmentStatus: string }) =>
      //         order.fulfillmentStatus === status
      //     )
      //   : ordersData;

      // return filteredOrders;
    }
  } catch (error) {
    console.error('Error fetching my orders data:', error);
  }
};
