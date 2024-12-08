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
import TableFilters from '@/components/Table/TableFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import SearchField from '@/components/Table/SearchField';
import { sortItems } from '@/pages/utils/sortItems';

const WholesalerCustomerOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);

  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  // const [orderStats, setOrdersStats] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

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

  // Filter orders based on search query and selected status
  useEffect(() => {
    const flteredBySearching = sampleOrders.filter((order) => {
      const searchMatch = Object.values(order)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === 'Status' || order.fulfillmentStatus === statusFilter;
      return searchMatch && statusMatch;
    });

    setFilteredOrders(flteredBySearching);
  }, [searchQuery, statusFilter, sampleOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    const filteredByFiltering =
      status === 'Status'
        ? sampleOrders
        : sampleOrders.filter((order) => order.fulfillmentStatus === status);

    setFilteredOrders(filteredByFiltering);
  };

  const tableColumns = [
    { title: 'Select', srOnly: true, id: 'select' },
    { title: 'Status', id: 'fulfillmentStatus', sortable: true },
    { title: 'Order ID', id: '_id', sortable: true },
    { title: 'Customer', id: 'customer', sortable: true },
    { title: 'Items', id: 'orderItems', sortable: true },
    { title: 'Total Price', id: 'totalPrice', sortable: true },
    { title: 'Order Date', id: 'orderDate', sortable: true },
    { title: 'Action', id: 'action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10; // Adjust the page size as needed

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (column: string) => {
    // Pre compute the next sort order and column to ensure that sortItems uses the updated values of sortColumn and sortOrder.
    // React state updates are asynchronous, which means that the updated sortColumn() and sortOrder()
    // may not immediately reflect in the subsequent sortItems call.
    const newSortOrder =
      sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    const newSortColumn = column;

    // Update state
    setSortColumn(newSortColumn);
    setSortOrder(newSortOrder);

    // Use the new values to sort immediately
    const sortedOrders = sortItems(filteredOrders, newSortColumn, newSortOrder);
    console.log(sortedOrders);
    setFilteredOrders(sortedOrders);
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

        {/* <TableActions /> */}

        {/* Filter Dropdown and Orders Table */}
        <TableFilters>
          <SearchField
            searchFieldPlaceholder='orders'
            onSearchChange={handleSearchChange}
          />
          {/* Filter by status */}
          <StatusFilters
            label='Filter by Status'
            options={[
              'Status',
              'Pending',
              'Fulfilled',
              'Shipped',
              'Delivered',
              'Completed',
              'Canceled',
            ]}
            selectedOption={statusFilter}
            onChange={handleStatusFilterChange}
          />
        </TableFilters>

        {/* Orders Table */}
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table
            id='customer-orders-table'
            className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'
          >
            <TableHead columns={tableColumns} handleSort={handleSort} />
            <tbody>
              {filteredOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow
                    key={order._id} // Important for performance
                    rowValues={[
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

                      {
                        content: order.totalPrice,
                      },
                      { content: order.orderDate },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                href: '#',
                                label: 'Remove',
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
            data={filteredOrders}
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
