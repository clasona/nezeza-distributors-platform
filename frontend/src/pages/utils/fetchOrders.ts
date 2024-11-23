export const fetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/orders/selling');
    const data = await response.json();
    const ordersData = data.orders;

    if (!response.ok) {
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
