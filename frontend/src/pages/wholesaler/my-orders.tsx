import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../utils/fetchOrders';
import { OrderProps } from '../../../type';
import axios from 'axios';

const WholesalerMyOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await fetchOrders();
        setExistingOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error('Error fetching existing orders data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddProductToInventory = async (order: OrderProps) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/inventory/inventory`,
        {
          owner: '6738cce73fd00e8f4df9d802',
          buyerStoreId: '6738cce73fd00e8f4df9d802',
          seller: '673c171bfd6cd3ad5f89ab06',
          description: order.items[0].description,
          price: order.items[0].price,
          image: order.items[0].image,
          productId: order.items[0]._id,
          stock: order.quantity,
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
    if (status === 'All orders') {
      setFilteredOrders(existingOrders);
    } else {
      setFilteredOrders(
        existingOrders.filter((order) => order.status === status)
      );
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl font-bold text-center mb-4 text-nezeza_dark_blue'>
        Wholesaler Store Name's Orders
      </h2>
      {successMessage && (
        <p className='text-center text-green-500'>{successMessage}</p>
      )}
      {/* Overview section */}

      <div className='flex flex-wrap gap-2 mb-6 justify-between'>
        <div className='flex items-center justify-between bg-gray-100 border border-gray-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-gray-700'>Total Orders</span>
          <span className='text-xl font-semibold text-gray-800'>
            {existingOrders.length}
          </span>
        </div>
        <div className='flex items-center justify-between bg-yellow-100 border border-yellow-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-yellow-700'>Pending</span>
          <span className='text-xl font-semibold text-yellow-800'>
            {
              existingOrders.filter((order) => order.status === 'Pending')
                .length
            }
          </span>
        </div>
        <div className='flex items-center justify-between bg-purple-100 border border-purple-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-purple-700'>Fulfilled</span>
          <span className='text-xl font-semibold text-purple-800'>
            {
              existingOrders.filter((order) => order.status === 'Fulfilled')
                .length
            }
          </span>
        </div>
        <div className='flex items-center justify-between bg-blue-100 border border-blue-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-blue-700'>Shipped</span>
          <span className='text-xl font-semibold text-blue-800'>
            {
              existingOrders.filter((order) => order.status === 'Shipped')
                .length
            }
          </span>
        </div>
        <div className='flex items-center justify-between bg-teal-100 border border-teal-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-teal-700'>Delivered</span>
          <span className='text-xl font-semibold text-teal-800'>
            {
              existingOrders.filter((order) => order.status === 'Delivered')
                .length
            }
          </span>
        </div>
        <div className='flex items-center justify-between bg-green-100 border border-green-500 p-4 rounded-md shadow-md flex-grow'>
          <span className='text-lg font-bold text-green-700'>Complete</span>
          <span className='text-xl font-semibold text-green-800'>
            {
              existingOrders.filter((order) => order.status === 'Complete')
                .length
            }
          </span>
        </div>
      </div>

      {/* Filter Dropdown */}

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
              <th className='px-4 py-2'>Category</th>
              <th className='px-4 py-2'>Image</th>
              <th className='px-4 py-2'>Tax</th>
              <th className='px-4 py-2'>Shipping Fee</th>
              <th className='px-4 py-2'>Payment Method</th>
              <th className='px-4 py-2'>Order Date</th>
              <th className='px-4 py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className='border-b hover:bg-gray-100'>
                <td className='px-4 py-2'>{order.status}</td>
                <td className='px-4 py-2'>{order.id}</td>
                <td className='px-4 py-2'>{order.items[0].title}</td>
                <td className='px-4 py-2'>{order.items[0].price}</td>
                <td className='px-4 py-2'>{order.items[0].quantity}</td>
                <td className='px-4 py-2'>{order.items[0].description}</td>
                <td className='px-4 py-2'>{order.items[0].category}</td>
                <td className='px-4 py-2'>
                  <img
                    src={order.items[0].image}
                    alt={order.items[0].title}
                    className='w-16 h-16 object-cover'
                  />
                </td>
                <td className='px-4 py-2'>{order.tax}</td>
                <td className='px-4 py-2'>{order.shippingFee}</td>
                <td className='px-4 py-2'>{order.paymentMethod}</td>
                <td className='px-4 py-2'>{new Date().toLocaleDateString()}</td>
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
      </div>
    </div>
  );
};

export default WholesalerMyOrders;
