import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../utils/fetchOrders';
import { OrderProps } from '../../../type';
import axios from 'axios';
import WholesalerLayout from './index';
import SmallCards from '@/components/SmallCards';
import { calculateOrderStats } from '../utils/orderUtils';
import Heading from '@/components/Heading';

const WholesalerMyOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  // const [orderStats, setOrdersStats] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('All orders');

  //For paginated table
  const PAGE_SIZE = 2;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentlyDisplayedData = existingOrders.slice(startIndex, endIndex);
  const numberOfPages = Math.ceil(existingOrders.length / PAGE_SIZE);
  const itemStartIndex = startIndex + 1;
  const itemEndIndex = Math.min(startIndex + PAGE_SIZE, existingOrders.length);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await fetchOrders();
        setExistingOrders(ordersData);
        setFilteredOrders(ordersData); // Initially show all orders
      } catch (error) {
        console.error('Error fetching existing orders data:', error);
      }
    };

    fetchData();
  }, []);

  const orderStats = calculateOrderStats(existingOrders);

  const handleAddProductToInventory = async (order: OrderProps) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/inventory/inventory',
        {
          owner: '6738cce73fd00e8f4df9d802',
          buyerStoreId: '6738cce73fd00e8f4df9d802',
          seller: '673c171bfd6cd3ad5f89ab06',
          description: order.orderItems[0].description,
          price: order.orderItems[0].price,
          image: order.orderItems[0].image,
          productId: order.orderItems[0]._id,
          stock: order.orderItems[0].quantity,
          averageRating: 0,
          numOfReviews: 0,
        }
      );

      if (response.status === 201) {
        setSuccessMessage('Product added to stock successfully');
      } else {
        console.error('Error adding product to inventory:', response.data);
      }
    } catch (error) {
      console.error('Error adding product to inventory:', error);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);

    const filtered =
      status === 'All orders'
        ? existingOrders
        : existingOrders.filter((order) => order.fulfillmentStatus === status);

    setFilteredOrders(filtered);
  };

  return (
    <WholesalerLayout>
      <Heading title='My Orders'></Heading>
      <div className='container mx-auto py-4'>
        {/* <h2 className='text-3xl font-bold text-center mb-4 text-nezeza_dark_blue'>
          Wholesaler Store Name's Orders
        </h2> */}
        {successMessage && (
          <p className='text-center text-green-500'>{successMessage}</p>
        )}

        {/* Replacing Overview Section with SmallCards */}
        <SmallCards orderStats={orderStats} />

        {/* Filter Dropdown and Orders Table */}
        <div className='flex justify-start mb-4'>
          <select
            className='p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:outline-none'
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value='All orders'>All orders</option>
            <option value='Pending'>Pending</option>
            <option value='Fulfilled'>Fulfilled</option>
            <option value='Shipped'>Shipped</option>
            <option value='Delivered'>Delivered</option>
            <option value='Complete'>Complete</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse border border-slate-500 shadow-lg'>
            <thead className='bg-nezeza_dark_blue text-white'>
              <tr>
                <th className='px-4 py-2'>Status</th>
                <th className='px-4 py-2'>Order ID</th>
                <th className='px-4 py-2'>Title</th>
                <th className='px-4 py-2'>Price</th>
                <th className='px-4 py-2'>Quantity</th>
                <th className='px-4 py-2'>Description</th>
                <th className='px-4 py-2'>Image</th>
                <th className='px-4 py-2'>Tax</th>
                <th className='px-4 py-2'>Shipping Fee</th>
                <th className='px-4 py-2'>Payment Method</th>
                <th className='px-4 py-2'>Order Date</th>
                <th className='px-4 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentlyDisplayedData.map((order) => (
                <tr key={order._id} className='border-b hover:bg-gray-100'>
                  <td className='px-4 py-2'>{order.fulfillmentStatus}</td>
                  <td className='px-4 py-2'>{order._id}</td>
                  <td className='px-4 py-2'>{order.orderItems[0].title}</td>
                  <td className='px-4 py-2'>{order.orderItems[0].price}</td>
                  <td className='px-4 py-2'>{order.orderItems[0].quantity}</td>
                  <td className='px-4 py-2'>
                    {order.orderItems[0].description}
                  </td>
                  <td className='px-4 py-2'>
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].title}
                      className='w-16 h-16 object-cover'
                    />
                  </td>
                  <td className='px-4 py-2'>{order.totalTax}</td>
                  <td className='px-4 py-2'>{order.totalShipping}</td>
                  <td className='px-4 py-2'>{order.paymentMethod}</td>
                  <td className='px-4 py-2'>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-2'>
                    <button
                      className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      onClick={() => handleAddProductToInventory(order)}
                    >
                      Add to Inventory
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: make this as a component instead? */}
          <nav
            className='flex items-center flex-column flex-wrap md:flex-row justify-between pt-4'
            aria-label='Table navigation'
          >
            <span className='text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto'>
              Showing {''}
              <span className='font-semibold text-gray-50 dark:text-white'>
                {itemStartIndex}-{itemEndIndex}
              </span>{' '}
              {''}
              of {''}
              <span className='font-semibold text-gray-50 dark:text-white'>
                {existingOrders.length}
              </span>
            </span>
            <ul className='inline-flex -space-x-px rtl:space-x-reverse test-sm h-14'>
              <li>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage == 1}
                  className='flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white 
                  border borger-gray-300 rounded-s-lg hover:bg-gray-100 hover:ext-gray-700 dark:bg-gray-800
                  dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                >
                  &#8592; Previous
                </button>
              </li>
              {Array.from({ length: numberOfPages }, (_, index) => {
                return (
                  <li key={index}>
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      // disabled={currentPage == index + 1}
                      // TODO: currently current page number doesnt get blue properties
                      className={`flex items-center justify-center px-3 h-10 leading-tight    
  border 
     
  ${
    currentPage == index + 1
      ? 'text-gray-50 bg-blue-600 border-blue-300 dark:bg-blue-600 dark:border-gray-700  dark:text-gray-50 dark:hover:bg-blue-900 dark:hover:text-white hover:bg-blue-900 hover:text-white'
      : 'text-gray-500 bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 hover:text-gray-700'
  }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage == numberOfPages}
                  className='flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white 
                  border borger-gray-300 rounded-e-lg hover:bg-gray-100 hover:ext-gray-700 dark:bg-gray-800
                  dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                >
                  Next &#8594;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </WholesalerLayout>
  );
};

WholesalerMyOrders.noLayout = true;
export default WholesalerMyOrders;
