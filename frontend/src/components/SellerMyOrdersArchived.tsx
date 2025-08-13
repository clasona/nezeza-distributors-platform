import MoreOrderDetailsModal from '@/components/Order/MoreOrderDetailsModal';
import PageHeader from '@/components/PageHeader';
import SmallCards from '@/components/SmallCards';
import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import Pagination from '@/components/Table/Pagination';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import SearchField from '@/components/Table/SearchField';
import TableFilters from '@/components/Table/TableFilters';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import { handleError } from '@/utils/errorUtils';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { getMyArchivedOrders } from '@/utils/order/getMyArchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import { sortItems } from '@/utils/sortItems';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { OrderProps } from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import Button from './FormInputs/Button';
import Loading from './Loaders/Loading';
import SuccessMessageModal from './SuccessMessageModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';
import { RotateCcw } from 'lucide-react';

const SellerMyOrders = () => {
  const [myOrders, setMyOrders] = useState<OrderProps[]>([]);

  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  // For sorting and filtering
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All', label: 'All' });
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
    // { title: 'Seller', id: 'seller', sortable: true },
    { title: 'Items', id: 'orderItems', sortable: true },
    { title: 'Total Amount', id: 'totalAmount', sortable: true },
    { title: 'Created', id: 'createdAt', sortable: true },
    { title: 'Updated', id: 'updatedAt', sortable: true },
    { title: 'Action', id: 'action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Adjust the page size as needed. useState() instead??

  //for bulk deleting
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  //for table row dropdown actions i.e: update, Delete
  const [isMoreOrderDetailsModalOpen, setIsMoreOrderDetailsModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<OrderProps | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State for loading

  //setting my orders data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const myOrdersData = await getMyArchivedOrders();
      setMyOrders(myOrdersData);
      setFilteredOrders(myOrdersData); // Initially show all orders
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false); // Set loading to false *after* fetch completes (success or error)
    }
  };
  useEffect(() => {
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
        statusFilter === null ||
        (statusFilter.value === 'All' && statusFilter.label === 'All') ||
        order.fulfillmentStatus === statusFilter.value;
      return searchMatch && statusMatch;
    });

    setFilteredOrders(flteredBySearching);
  }, [searchQuery, statusFilter, myOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
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
      const createdDate = order.createdAt; // YYYY-MM-DD format
      const isAfterStart = start ? createdDate >= start : true;
      const isBeforeEnd = end ? createdDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setStatusFilter({ value: 'All', label: 'All' });
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

  const handleMoreOrderDetails = (rowData: OrderProps) => {
    setCurrentRowData(rowData);
    setIsMoreOrderDetailsModalOpen(true);
  };
  const handleCloseMoreOrderDetailsModal = () => {
    setIsMoreOrderDetailsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
  };

  const handleDeleteClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsDeleteModalOpen(true); // Open the modal
  };

  const handleConfirmDelete = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );

    setSuccessMessage(`Order # ${id} deleted successfully.`);
    //TODO: Delete from database
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  //for bulk deleting
  const handleSelectRow = (id: string) => {
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
      // await Promise.all(selectedRows.map((id) => deleteMyOrder(id)));

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
        heading='Archived Orders'
        actions={
          <Button
            isLoading={isLoading}
            icon={RotateCcw}
            buttonTitle='Refresh'
            buttonTitleClassName='hidden md:inline'
            loadingButtonTitle='Refreshing...'
            className='text-vesoko_dark_blue hover:text-white hover:bg-vesoko_dark_blue'
            onClick={async () => {
              await fetchData();
            }}
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

        {/* Filter by dates */}
        {/* Filter by dates (always on large, conditional on small) */}
        <DateFilters
          label='Filter by Date Range'
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        {/* TODO: Currently disabled. Can be used if we have to more filters.
         Filter by dates (always on large, conditional on small) */}
        {/* <button
          onClick={toggleMoreFilters}
          className='hidden sm:inline text-sm text-vesoko_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button> */}
        {/* Clear Filters Button */}
        <ClearFilters clearFiltersFunction={clearFilters} />
      </TableFilters>
      <SearchField
        searchFieldPlaceholder='my archived orders'
        onSearchChange={handleSearchChange}
      />

      {/* My Orders Table */}
      <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
        <table
          id='my-orders-table'
          className='w-full text-sm text-left rtl:text-right text-vesoko_gray_600 dark:text-gray-400'
        >
          <TableHead
            checked={selectedRows.length === filteredOrders.length}
            onChange={handleSelectAllRows}
            hasCollapsibleContent={true} // for adding arrow up&down in table columns
            columns={tableColumns}
            handleSort={handleSort}
          />
          {isLoading ? ( // Show loading indicator
            <Loading message='archived orders' />
          ) : filteredOrders.length === 0 ? (
            <p className='text-center'>No archived orders found</p>
          ) : (
            <tbody>
              {filteredOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow
                    key={order._id}
                    hasCollapsibleContent={true}
                    rowData={order}
                    rowValues={[
                      {
                        content: (
                          <input
                            type='checkbox'
                            checked={selectedRows.includes(order._id)}
                            onChange={() => handleSelectRow(order._id)}
                          />
                        ),
                      },
                      { content: order.fulfillmentStatus, isStatus: true },
                      { content: order._id },
                      // { content: '' },
                      {
                        content: (
                          <Link href='#' className='text-vesoko_dark_blue'>
                            {order.orderItems.length}{' '}
                          </Link>
                        ),
                      }, //TODO: make it show order products details when clicked
                      { content: `$${formatPrice(order.totalAmount)}` },
                      { content: formatDate(order.createdAt) },
                      { content: formatDate(order.updatedAt) },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                label: 'More Details',
                                onClick: () => handleMoreOrderDetails(order), //TODO: replace with view more order details
                              },

                              {
                                label: 'Delete',
                                onClick: () => handleDeleteClick(order),
                              },
                            ]}
                          />
                        ),
                      },
                    ]}
                    onDelete={handleDelete}
                    // control collapsible section for order items
                    renderCollapsibleContent={(order) => (
                      <div className='flex flex-col gap-4'>
                        {order.orderItems.map((item) => (
                          <div
                            key={item._id}
                            className='flex items-center px-20 gap-4 border-b border-vesoko_light_blue pb-2'
                          >
                            <Image
                              src={item.image}
                              alt={item.description}
                              width={48}
                              height={48}
                              className='w-12 h-12 object-cover'
                            />
                            <div className=''>
                              <p className='font-semibold'>
                                {item.product.title || 'Title Missing'}
                              </p>
                              <p className='text-vesoko_gray_600'>
                                {item.quantity} x ${item.price}
                              </p>
                              <p>
                                Seller:{' '}
                                <Link
                                  href='#'
                                  target='_blank'
                                  className='text-vesoko_dark_blue'
                                >
                                  {item.sellerStoreId.name ||
                                    'Store Name Missing'}
                                </Link>
                              </p>
                              {/* TODO: link to seller's store on platform */}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                ))}
              ;
            </tbody>
          )}
        </table>
        <Pagination
          data={filteredOrders}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />

        {/* More Details Modal */}
        <MoreOrderDetailsModal
          isOpen={isMoreOrderDetailsModalOpen}
          rowData={currentRowData}
          onClose={handleCloseMoreOrderDetailsModal}
          // onSave={handleSaveUpdatedRow}
        />

        {/* Delete Row Modal */}
        {isDeleteModalOpen && currentRowData && (
          <DeleteRowModal
            isOpen={isDeleteModalOpen}
            rowData={currentRowData}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={() => handleConfirmDelete(currentRowData._id)}
          />
        )}
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
        {/* Error Message */}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </div>
    </div>
  );
};

export default SellerMyOrders;
