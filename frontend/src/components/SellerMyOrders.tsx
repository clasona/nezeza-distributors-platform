import MoreOrderDetailsModal from '@/components/Order/MoreOrderDetailsModal';
import PageHeader from '@/components/PageHeader';
import PageHeaderLink from '@/components/PageHeaderLink';
import SmallCards from '@/components/SmallCards';
import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import Pagination from '@/components/Table/Pagination';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import SearchField from '@/components/Table/SearchField';
import TableFilters from '@/components/Table/TableFilters';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import { getOrderStatus } from '@/lib/utils';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { archiveOrder } from '@/utils/order/archiveOrder';
import { getMyUnarchivedOrders } from '@/utils/order/getMyUnarchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import { checkIfProductExists } from '@/utils/product/checkIfProductExists';
import { sortItems } from '@/utils/sortItems';
import { Plus, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { OrderItemsProps, OrderProps } from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import Button from './FormInputs/Button';
import Loading from './Loaders/Loading';
import ConfirmNewProductModal from './Product/ConfirmNewProductModal';
import ConfirmUpdateProductModal from './Product/ConfirmUpdateProductModal';
import SuccessMessageModal from './SuccessMessageModal';
import ArchiveRowModal from './Table/ArchiveRowModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';

const SellerMyOrders = () => {
  const [myOrders, setMyOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  // For handling adding ordered products to inventory
  const [selectedItemToUpdate, setSelectedItemToUpdate] =
    useState<OrderItemsProps | null>(null);
  const [selectedItemToCreate, setSelectedItemToCreate] =
    useState<OrderItemsProps | null>(null);
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmUpdateProductModalOpen, setIsConfirmUpdateProductModalOpen] =
    useState(false);
  const [isConfirmNewProductModalOpen, setIsConfirmNewProductModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<OrderProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //setting my orders data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const myOrdersData = await getMyUnarchivedOrders();
      setMyOrders(myOrdersData);
      setFilteredOrders(myOrdersData); // Initially show all orders
    } catch (error) {
      console.error('Error fetching my orders data:', error);
    } finally {
      setIsLoading(false);
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
      const createdDate = order.createdAt; // YYYY-MM-DD format
      const isAfterStart = start ? createdDate >= start : true;
      const isBeforeEnd = end ? createdDate <= end : true;
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

  const handleMoreOrderDetails = (rowData: OrderProps) => {
    setCurrentRowData(rowData);
    setIsMoreOrderDetailsModalOpen(true);
  };
  const handleCloseMoreOrderDetailsModal = () => {
    setIsMoreOrderDetailsModalOpen(false);
  };

  const handleUpdate = (rowData: OrderProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
  };
  const handleSaveUpdatedRow = (updatedRow: OrderProps) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedRow._id ? { ...order, ...updatedRow } : order
      )
    );
    // TODO: Update in db
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
    setIsUpdateModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
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

  const handleConfirmDelete = async (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
    //TODO: Delete from database

    setSuccessMessage(`Order # ${id} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleArchiveClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsArchiveModalOpen(true); // Open the modal
  };
  const handleConfirmArchive = (id: string) => {
    getOrderStatus(id).then((status) => {
      if (status) {
        if (status === 'Completed') {
          setErrorMessage('');

          setFilteredOrders((prevOrders) =>
            prevOrders.filter((order) => order._id !== id)
          );
          const orderData: Partial<OrderProps> = {
            fulfillmentStatus: 'Archived',
          };
          if (id) {
            archiveOrder(id, orderData).then(() => {
              setSuccessMessage(`Order # ${id} archived successfully.`);
              setIsArchiveModalOpen(false);
              setTimeout(() => setSuccessMessage(''), 4000);
            });
          }
        } else {
          setErrorMessage(
            "Order status must be 'Completed' to perform this action."
          );
          setTimeout(() => setErrorMessage(''), 4000);
        }
      }
    });
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

  const confirmProductExists = async (productId: string) => {
    const productExists = await checkIfProductExists(productId);
    if (productExists) {
      setIsConfirmUpdateProductModalOpen(true); // Open the modal
      // setErrorMessage('');
    } else {
      setErrorMessage(
        'Product does not exist in your current inventory. You can add it as a new product.'
      );
      setTimeout(() => setErrorMessage(''), 4000);
      // return;
    }
  };

  return (
    <div>
      <PageHeader
        heading='My Orders'
        actions={
          <Button
            isLoading={isLoading}
            buttonTitle='Refresh'
            loadingButtonTitle='Refreshing...'
            className='text-nezeza_dark_blue hover:text-white hover:bg-nezeza_dark_blue'
            onClick={async () => {
              await fetchData();
            }}
          />
        }
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
        {showMoreFilters && (
          <DateFilters
            label='Filter by Date Range'
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        )}
        <button
          onClick={toggleMoreFilters}
          className='text-sm text-nezeza_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button>
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
          {isLoading ? ( // Show loading indicator
            <Loading message='my orders' />
          ) : filteredOrders.length === 0 ? (
            <p className='text-center'>No my orders found</p>
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
                          <Link href='#' className='text-nezeza_dark_blue'>
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

                              // {
                              //   label: 'Update',
                              //   onClick: () => handleUpdate(order),
                              //   //TODO: only allow them to modify it if order status is pending
                              // },
                              {
                                label: 'Delete',
                                onClick: () => handleDeleteClick(order),
                              },
                              {
                                label: 'Archive',
                                onClick: () => handleArchiveClick(order),
                              },
                            ]}
                          />
                        ),
                      },
                    ]}
                    onUpdate={handleSaveUpdatedRow}
                    onDelete={handleDelete}
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
                              <p className='font-semibold'>
                                {item.product.title || 'Title Missing'}
                              </p>
                              <p className='text-nezeza_gray_600'>
                                {item.quantity} x ${item.price}
                              </p>
                              <p>
                                Seller:{' '}
                                <Link
                                  href='#'
                                  target='_blank'
                                  className='text-nezeza_dark_blue'
                                >
                                  {item.sellerStoreId.name ||
                                    'Store Name Missing'}
                                </Link>
                              </p>
                              {/* TODO: link to seller's store on platform */}
                            </div>
                            <div className='flex ml-4 items-center justify-center gap-2'>
                              <span>
                                Already have this product in your inventory?{' '}
                              </span>

                              <Button
                                buttonTitle='Update Product'
                                icon={RotateCw}
                                className='px-2 py-1 outline text-nezeza_dark_blue hover:text-white hover:bg-nezeza_dark_blue'
                                onClick={async () => {
                                  getOrderStatus(order._id).then((status) => {
                                    if (status) {
                                      if (status === 'Completed') {
                                        setErrorMessage('');
                                        setSelectedItemToUpdate(item);
                                        setIsConfirmUpdateProductModalOpen(
                                          true
                                        );
                                      } else {
                                        setErrorMessage(
                                          "Order status must be 'Completed' to perform this action."
                                        );
                                        setTimeout(
                                          () => setErrorMessage(''),
                                          4000
                                        );
                                      }
                                    }
                                  });
                                }}
                              />
                              <span>or</span>

                              {/* Update Inventory Modal */}
                              {selectedItemToUpdate === item && ( // Conditional rendering for the selected item
                                <ConfirmUpdateProductModal
                                  isOpen={isConfirmUpdateProductModalOpen}
                                  orderId={order._id}
                                  item={selectedItemToUpdate}
                                  onClose={() => {
                                    setIsConfirmUpdateProductModalOpen(false);
                                    setSelectedItemToUpdate(null); // Clear selected item
                                  }}
                                />
                              )}
                              <Button
                                buttonTitle='Create New Product'
                                icon={Plus}
                                className='px-2 py-1 outline text-nezeza_green_600 hover:text-white hover:bg-nezeza_green_600'
                                onClick={() => {
                                  getOrderStatus(order._id).then((status) => {
                                    if (status) {
                                      if (status === 'Completed') {
                                        setErrorMessage('');
                                        setSelectedItemToCreate(item);
                                        setIsConfirmNewProductModalOpen(true);
                                      } else {
                                        setErrorMessage(
                                          "Order status must be 'Completed' to perform this action."
                                        );
                                        setTimeout(
                                          () => setErrorMessage(''),
                                          4000
                                        );
                                      }
                                    }
                                  });
                                }}
                              />
                              {selectedItemToCreate === item && (
                                <ConfirmNewProductModal
                                  isOpen={isConfirmNewProductModalOpen}
                                  orderId={order._id}
                                  item={selectedItemToCreate}
                                  onClose={() => {
                                    setIsConfirmUpdateProductModalOpen(false);
                                    setSelectedItemToCreate(null); // Clear selected item
                                  }}
                                />
                              )}
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
        {isMoreOrderDetailsModalOpen && currentRowData && (
          <MoreOrderDetailsModal
            isOpen={isMoreOrderDetailsModalOpen}
            rowData={currentRowData}
            onClose={handleCloseMoreOrderDetailsModal}
            // onSave={handleSaveUpdatedRow}
          />
        )}

        {/* Update Row Modal */}
        {isUpdateModalOpen && currentRowData && (
          <UpdateRowModal
            isOpen={isUpdateModalOpen}
            rowData={currentRowData}
            onClose={handleCloseUpdateModal}
            onSave={handleSaveUpdatedRow}
          />
        )}
        {/* Delete Row Modal */}
        {isDeleteModalOpen && currentRowData && (
          <DeleteRowModal
            isOpen={isDeleteModalOpen}
            rowData={currentRowData}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={() => handleConfirmDelete(currentRowData._id)}
          />
        )}
        {/* Archive Row Modal */}
        {isArchiveModalOpen && currentRowData && (
          <ArchiveRowModal
            isOpen={isArchiveModalOpen}
            rowData={currentRowData}
            onClose={() => setIsArchiveModalOpen(false)}
            onArchive={() => handleConfirmArchive(currentRowData._id)}
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
