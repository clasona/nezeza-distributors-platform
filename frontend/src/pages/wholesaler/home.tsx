// import React, { useState, useEffect } from 'react';
// import WholesalerLayout from './layout';
// import Heading from '@/components/Heading';
// import { fetchInventory } from '../utils/inventory/fetchInventory';
// import { InventoryProps } from '../../../type';
// import mockMyInventory from './mock-data/mockInventory';
// import Products from '@/components/Products';

// const Dashboard = () => {
//   const [existingInventory, setExistingInventory] = useState<InventoryProps[]>(
//     []
//   );
//   const [sampleInventory, setSampleInventory] = useState<InventoryProps[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // const InventoryData = await fetchInventory();
//         // setExistingInventory(InventoryData);

//         const sampleInventoryData = mockMyInventory;
//         setSampleInventory(sampleInventoryData);
//       } catch (error) {
//         console.error('Error fetching existing inventory data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <WholesalerLayout>
//       <Heading title='Home'></Heading>

//       {/* Show store products */}
//       <Products productData={sampleInventory} />
//     </WholesalerLayout>
//   );
// };
// Dashboard.noLayout = true;
// export default Dashboard;
