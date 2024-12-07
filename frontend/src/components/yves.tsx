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
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import TableFilters from '@/components/Table/TableFilters';

const WholesalerCustomerOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('Status');

  const orderStats = calculateOrderStats(existingOrders);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //sample orders
        const sampleOrdersData = mockOrders;
        // const ordersData = await fetchOrders();
        // setExistingOrders(ordersData);
        setSampleOrders(sampleOrdersData);
        setFilteredOrders(sampleOrdersData); // Initially show all orders
      } catch (error) {
        console.error('Error fetching existing orders data:', error);
      }
    };

    fetchData();
  }, []);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    const filtered =
      status === 'Status'
        ? sampleOrders
        : sampleOrders.filter((order) => order.fulfillmentStatus === status);

    console.log('Filtered Orders:', filtered);

    setFilteredOrders(filtered);
  };

  const tableColumns = [
    { title: 'Select', srOnly: true },
    { title: 'Status' },
    { title: 'Order ID' },
    { title: 'Customer' },
    { title: 'Items' },
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
          heading='Customer Orders'
          href='./orders/new'
          linkTitle='Create New Order'
        />

        {/* Replacing Overview Section with SmallCards */}
        <SmallCards orderStats={orderStats} />

        <TableActions searchFieldPlaceholder='orders'>
          <StatusFilters
            label='Filter by Status'
            options={['Status', 'Pending', 'Completed', 'Canceled']}
            selectedOption={statusFilter}
            onChange={handleStatusFilterChange}
          />
        </TableActions>

        {/* Orders Table */}
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
            {/* Rest of your table code */}
            <TableHead columns={tableColumns} />

            <tbody>
              {filteredOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow
                    key={order._id} // Important for performance
                    rowValues=[
                      { content: <input type='checkbox' /> }, // Assuming you want a checkbox
                      { content: order.fulfillmentStatus },
                      { content: order._id },
                      { content: '' },
                      {
                        content: (
                          <Link href='#' className='text-nezeza_dark_blue'>
                            {order.orderItems.length}{' '}
                          </Link>
                        ),
                      }, //TODO: make it show order products
                      { content: `$${order.orderItems[0].price.toFixed(2)}` },
                      { content: '12/23/2024' },

                      {
                        content: (
                          <RowActionDropdown
                            actions=[
                              {
                                href: './orders/new',
                                label: 'Add to inventory',
                              },
                              { href: '#', label: 'Update' },
                            ]
                          />
                        ),
                      },
                    ]
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

WholesalerCustomerOrders.noLayout = true;
export default WholesalerCustomerOrders;
