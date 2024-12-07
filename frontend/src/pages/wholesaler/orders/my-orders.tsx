import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../../utils/fetchOrders';
import { OrderProps, ProductProps } from '../../../../type';
import axios from 'axios';
import WholesalerLayout from '../index';
import SmallCards from '@/components/SmallCards';
import { calculateOrderStats } from '../../utils/orderUtils';
import Heading from '@/components/Heading';
import Pagination from '@/components/Table/Pagination';
import PageHeader from '@/components/PageHeader';
import TableActions from '@/components/Table/TableActions';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import Link from 'next/link';
import mockOrders from '../mock-data/mockOrders';

const WholesalerMyOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  // const [orderStats, setOrdersStats] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('All orders');

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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);

    const filtered =
      status === 'All orders'
        ? existingOrders
        : existingOrders.filter((order) => order.fulfillmentStatus === status);

    setFilteredOrders(filtered);
  };

  //sample orders
  const sampleOrders = mockOrders;

  const tableColumns = [
    { title: 'Select', srOnly: true },
    { title: 'Status' },
    { title: 'ID' },
    { title: '# of Products' },
    { title: 'Total Price' },
    { title: 'Order Date' },

    { title: 'Action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 2; // Adjust the page size as needed

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <WholesalerLayout>
      <div className=''>
        <PageHeader
          heading='My Orders'
          href='./orders/new'
          linkTitle='Create New Order'
        />

        {/* Replacing Overview Section with SmallCards */}
        <SmallCards orderStats={orderStats} />

        <TableActions searchFieldPlaceholder='orders' />

        {/* Filter Dropdown and Orders Table */}
        <div className='flex justify-start mb-4 mt-4'>
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
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
            {/* Rest of your table code */}
            <TableHead columns={tableColumns} />

            <tbody>
              {sampleOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow
                    key={order._id} // Important for performance
                    rowValues={[
                      { content: <input type='checkbox' /> }, // Assuming you want a checkbox
                      { content: order.fulfillmentStatus },
                      { content: order._id },
                      {
                        content: (
                          <Link href='#' className='text-nezeza_dark_blue'>
                            {order.orderItems.length}{' '}
                          </Link>
                        ),
                      }, //TODO: make it show order products
                      { content: `$${order.orderItems[0].price.toFixed(2)}` },
                      { content: order.totalTax },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                href: './orders/new',
                                label: 'Add to inventory',
                              },
                              { href: '#', label: 'Update' },
                            ]}
                          />
                        ),
                      },
                    ]}
                  />
                ))}
              ;
            </tbody>
          </table>
          <Pagination
            data={sampleOrders}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </WholesalerLayout>
  );
};

WholesalerMyOrders.noLayout = true;
export default WholesalerMyOrders;
