// import React, { useState, useEffect } from 'react';
// import WholesalerLayout from './layout';
// import Heading from '@/components/Heading';
// import LargeCards from '@/components/LargeCards';
// import SmallCards from '@/components/SmallCards';
// import { fetchOrders } from '../utils/order/fetchMyOrders';
// import { calculateOrderStats } from '../utils/orderUtils';
// import { OrderProps } from '../../../type';
// import mockMyOrders from './mock-data/mockMyOrders';

// const Dashboard = () => {
//   const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
//   const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // const ordersData = await fetchOrders();
//         // setExistingOrders(ordersData);

//         const sampleOrdersData = mockMyOrders;
//         setSampleOrders(sampleOrdersData);
//       } catch (error) {
//         console.error('Error fetching existing orders data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   const orderStats = calculateOrderStats(sampleOrders);

//   return (
//     <WholesalerLayout>
//       <Heading title='Dashboard Overview'></Heading>
//       {/* Large Cards */}
//       <LargeCards />
//       {/* Small Cards */}
//       <h4>My Orders Overview</h4>
//       <SmallCards orderStats={orderStats} />
//       <h4>Customer Orders Overview</h4>
//       {/* Sales Charts */}
//       <h4>Weekly Charts</h4>
//       {/* 1:48 at https://www.youtube.com/watch?v=KY1t_AvyD-0&list=PLDn5_2K0bUmfREsFv1nSHDbmHEX5oqI3Z&ab_channel=JBWEBDEVELOPER */}
//       {/* Recent orders table */}
//     </WholesalerLayout>
//   );
// };
// Dashboard.noLayout = true;
// export default Dashboard;
