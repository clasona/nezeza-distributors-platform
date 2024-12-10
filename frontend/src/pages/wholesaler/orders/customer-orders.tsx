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
import mockCustomerOrders from '../mock-data/mockCustomerOrders';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TableFilters from '@/components/Table/TableFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import SearchField from '@/components/Table/SearchField';
import { sortItems } from '@/pages/utils/sortItems';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import RemoveRowModal from '@/components/Table/RemoveRowModal';
import formatPrice from '@/pages/utils/formatPrice';

const WholesalerCustomerOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);

  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  // const [orderStats, setOrdersStats] = useState<OrderProps[]>([]);
    const [successMessage, setSuccessMessage] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  const orderStats = calculateOrderStats(filteredOrders);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //sample orders
        const sampleOrdersData = mockCustomerOrders;
        // const ordersData = await fetchOrders();
        // setExistingOrders(ordersData);
        setSampleOrders(sampleOrdersData);
        setFilteredOrders(sampleOrdersData); // Initially show all orders
      } catch (error) {
        console.error('Error fetching existing customer orders data:', error);
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
    const filteredByStatusFiltering =
      status === 'Status'
        ? sampleOrders
        : sampleOrders.filter((order) => order.fulfillmentStatus === status);

    setFilteredOrders(filteredByStatusFiltering);
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
    setFilteredOrders(sortedOrders);
  };

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const [currentRowData, setCurrentRowData] = useState<OrderProps>({
    _id: 0,
    fulfillmentStatus: '',
    orderItems: [],
    quantity: 0,
    totalPrice: 0,
    totalTax: 0,
    totalShipping: 0,
    orderDate: '',
    paymentMethod: '',
  });

  const handleUpdate = (rowData: OrderProps) => {
    
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
  };
  const handleSaveUpdatedRow = (updatedRow: OrderProps) => {
    // Update filteredOrders to reflect the updated row
    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedRow._id ? { ...order, ...updatedRow } : order
      )
    );
        setSuccessMessage(
          `Order # ${updatedRow._id} updated successfully.`
        );

    setIsUpdateModalOpen(false); // Close the modal after saving
        setTimeout(() => setSuccessMessage(''), 4000);

  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleRemove = (id: number) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
  };

  const handleRemoveClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsRemoveModalOpen(true); // Open the modal
  };

  const handleConfirmRemove = (id: number) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
        setSuccessMessage(
          `Order # ${id} deleted successfully.`
        );

    //TODO: Remove from database
    setIsRemoveModalOpen(false); // Close the modal after deletion
        setTimeout(() => setSuccessMessage(''), 4000);

  };


  return (
    <WholesalerLayout>
      <div>
        <PageHeader
          heading='Customer Orders'
          href='./orders/new'
          linkTitle='Create New Order'
        />

        {/* Replacing Overview Section with SmallCards */}
        <SmallCards orderStats={orderStats} />

        {/* <TableActions /> */}

        {/* Table Search field and Filter Dropdown*/}
        <TableFilters>
          <SearchField
            searchFieldPlaceholder='customer orders'
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

        {/* Customer Orders Table */}
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
                    key={order._id}
                    rowData={order}
                    rowValues={[
                      { content: <input type='checkbox' /> },
                      { content: order.fulfillmentStatus, isStatus: true },
                      { content: order._id },
                      { content: '' },
                      {
                        content: (
                          <Link href='#' className='text-nezeza_dark_blue'>
                            {order.orderItems.length}{' '}
                          </Link>
                        ),
                      }, //TODO: make it show order products details when clicked
                      { content: `$${formatPrice(order.totalPrice)}` },
                      { content: order.orderDate },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                label: 'Update',
                                onClick: () => handleUpdate(order),
                              },
                              {
                                label: 'Remove',
                                onClick: () => handleRemoveClick(order),
                              },
                            ]}
                          />
                        ),
                      },
                    ]}
                    onUpdate={handleSaveUpdatedRow}
                    onRemove={handleRemove}
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
          {/* Update Row Modal */}
          <UpdateRowModal
            isOpen={isUpdateModalOpen}
            rowData={currentRowData}
            onClose={handleCloseUpdateModal}
            onSave={handleSaveUpdatedRow}
          />
          {/* Remove Row Modal */}
          <RemoveRowModal
            isOpen={isRemoveModalOpen}
            rowData={currentRowData}
            onClose={() => setIsRemoveModalOpen(false)}
            onDelete={() => handleConfirmRemove(currentRowData._id)}
          />
          {/* Success Message */}
          {successMessage && (
            <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md'>
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </WholesalerLayout>
  );
};

WholesalerCustomerOrders.noLayout = true;
export default WholesalerCustomerOrders;
