import React, { useState, useEffect } from 'react';
import { fetchMyOrders } from '@/pages/utils/order/fetchMyOrders';
import { OrderProps, ProductProps } from '../../type';
import axios from 'axios';
import SmallCards from '@/components/SmallCards';
import { calculateOrderStats } from '@/pages/utils/orderUtils';
import Heading from '@/components/Heading';
import PageHeader from '@/components/PageHeader';
import TableActions from '@/components/Table/TableActions';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import Link from 'next/link';
import Pagination from '@/components/Table/Pagination';
import { ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import TableFilters from '@/components/Table/TableFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import SearchField from '@/components/Table/SearchField';
import { sortItems } from '@/pages/utils/sortItems';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import RemoveRowModal from '@/components/Table/RemoveRowModal';
import formatPrice from '@/pages/utils/formatPrice';
import PageHeaderLink from '@/components/PageHeaderLink';
import DateFilters from '@/components/Table/Filters/DateFilters';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import {
  formatIdByTimestamp,
  formatIdByShortening,
} from '@/pages/utils/formatId';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';
import SuccessMessageModal from './SuccessMessageModal';

const SellerMyOrders = () => {
  const [myOrders, setMyOrders] = useState<OrderProps[]>([]);
  const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);

  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // For sorting and filtering
  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // for the small cards
  const orderStats = calculateOrderStats(filteredOrders);

  //for defining what table headers needed
  const tableColumns = [
    { title: 'Status', id: 'fulfillmentStatus', sortable: true },
    { title: 'Order ID', id: '_id', sortable: true },
    { title: 'Seller', id: 'seller', sortable: true },
    { title: 'Items', id: 'orderItems', sortable: true },
    { title: 'Total Price', id: 'totalPrice', sortable: true },
    { title: 'Order Date', id: 'orderDate', sortable: true },
    { title: 'Action', id: 'action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Adjust the page size as needed. useState() instead??

  //for bulk deleting
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  //for table row dropdown actions i.e: update, remove
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

  //setting my orders data
  useEffect(() => {
    const fetchData = async () => {
      try {
        //sample orders
        // const sampleOrdersData = mockMyOrders;
        const myOrdersData = await fetchMyOrders();
        setMyOrders(myOrdersData);

        // setSampleOrders(sampleOrdersData);
        setFilteredOrders(myOrdersData); // Initially show all orders
      } catch (error) {
        console.error('Error fetching my orders data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter orders based on search query and selected status
  useEffect(() => {
    const flteredBySearching = myOrders.filter((order) => {
      const searchMatch = Object.values(order)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === 'Status' || order.fulfillmentStatus === statusFilter;
      return searchMatch && statusMatch;
    });

    setFilteredOrders(flteredBySearching);
  }, [searchQuery, statusFilter, myOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    const filteredByStatusFiltering =
      status === 'Status'
        ? myOrders
        : myOrders.filter((order) => order.fulfillmentStatus === status);

    setFilteredOrders(filteredByStatusFiltering);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    applyDateFilter(value, endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    applyDateFilter(startDate, value);
  };

  const applyDateFilter = (start: string, end: string) => {
    const filtered = myOrders.filter((order) => {
      const orderDate = order.orderDate; // YYYY-MM-DD format
      const isAfterStart = start ? orderDate >= start : true;
      const isBeforeEnd = end ? orderDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('Status');
    setStartDate('');
    setEndDate('');
    setFilteredOrders(myOrders); // Reset to all orders
  };

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
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
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

    setSuccessMessage(`Order # ${id} deleted successfully.`);
    //TODO: Remove from database
    setIsRemoveModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  //for bulk deleting
  const handleSelectRow = (id: number) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };
  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredOrders.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredOrders.map((item) => item._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((id) => deleteMyOrder(userInfo, id)));

      setFilteredOrders((prevInventory) =>
        prevInventory.filter((item) => !selectedRows.includes(item._id))
      );

      setSelectedRows([]);
      setSuccessMessage('Selected items deleted successfully.');
    } catch (error) {
      console.error('Error deleting selected items:', error);
      alert('Error deleting selected items.');
    } finally {
      setIsBulkDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <PageHeader
        heading='My Orders'
        extraComponent={
          <PageHeaderLink
            linkTitle={'Create New Order'}
            href={'./orders/new'}
          />
        }
      />
      {/* Replacing Overview Section with SmallCards */}
      <SmallCards orderStats={orderStats} />

      {/* <TableActions /> */}

      {/* Table Search field and Filter Dropdown*/}
      <TableFilters>
        <BulkDeleteButton
          onClick={() => setIsBulkDeleteModalOpen(true)}
          isDisabled={selectedRows.length === 0}
        />
        <SearchField
          searchFieldPlaceholder='my orders'
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
        {/* Filter by dates */}
        <DateFilters
          label='Filter by Date Range'
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        {/* Clear Filters Button */}
        <ClearFilters clearFiltersFunction={clearFilters} />
      </TableFilters>

      {/* My Orders Table */}
      <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
        <table
          id='my-orders-table'
          className='w-full text-sm text-left rtl:text-right text-nezeza_gray_600 dark:text-gray-400'
        >
          <TableHead
            checked={selectedRows.length === filteredOrders.length}
            onChange={handleSelectAllRows}
            hasCollapsibleContent={true} // for adding arrow up&down in table columns
            columns={tableColumns}
            handleSort={handleSort}
          />
          <tbody>
            {filteredOrders
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((order) => (
                <TableRow
                  key={order._id}
                  hasCollapsibleContent={true} // for viewing order items as collapsible rows
                  rowData={order}
                  rowValues={[
                    { content: <input type='checkbox' /> },
                    { content: order.fulfillmentStatus, isStatus: true },
                    { content: formatIdByShortening(order._id) },
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
                              label: 'Add to inventory',
                              onClick: () => handleUpdate(order), //TODO: replace with add to inventory
                            },
                            {
                              label: 'Update',
                              onClick: () => handleUpdate(order),
                              //TODO: only allow them to modify it if order status is pending
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
                  // control collapsible section for order items
                  renderCollapsibleContent={(order) => (
                    <div className='flex flex-col gap-4'>
                      {order.orderItems.map((item) => (
                        <div
                          key={item._id}
                          className='flex items-center px-20 gap-4 border-b border-nezeza_light_blue pb-2'
                        >
                          <img
                            src={item.image}
                            alt={item.description}
                            className='w-12 h-12 object-cover'
                          />
                          <div className=''>
                            <p className='font-semibold'>{item.description}</p>
                            <p className='text-nezeza_gray_600'>
                              {item.quantity} x ${item.price}
                            </p>
                            {/* TODO: link to seller's store on platform */}
                            <Link
                              href='#'
                              target='_blank'
                              className='text-nezeza_gray_600'
                            >
                              (SELLER Name & LINK)
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
        {/* Bulk Delete Confirmation Modal */}
        <BulkDeleteModal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDelete}
        />
        {/* Success Message */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
      </div>
    </div>
  );
};

export default SellerMyOrders;
