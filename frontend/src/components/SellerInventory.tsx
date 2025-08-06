import PageHeader from '@/components/PageHeader';
import PageHeaderLink from '@/components/PageHeaderLink';
import MetricCard from '@/components/Charts/MetricCard';
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
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { deleteProduct } from '@/utils/product/deleteProduct';
import { getAllProducts } from '@/utils/product/getAllProducts';
import { sortItems } from '@/utils/sortItems';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProductProps, stateProps } from '../../type';
import Button from './FormInputs/Button';
import Loading from './Loaders/Loading';
import SuccessMessageModal from './SuccessMessageModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';
import { handleError } from '@/utils/errorUtils';
import { 
  RotateCcw, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Star,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Archive,
  Eye
} from 'lucide-react';

// interface SellerProductProps {
//   inventoryData: ProductProps[];
// }
const SellerInventory = () => {
  const [inventoryData, setInventoryData] = useState<ProductProps[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<ProductProps[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(
    null
  );
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All', label: 'All' });
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //for defining what table headers needed
  const tableColumns = [
    { title: 'ID', id: '_id', sortable: true },
    { title: 'Image', id: 'image' },
    { title: 'Title', id: 'title', sortable: true },
    { title: 'Qty', id: 'quantity', sortable: true },
    { title: 'Price', id: 'price', sortable: true },
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<ProductProps | null>(
    null
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // State for loading
  // Metric calculations
  const totalInventoryValue = filteredInventory.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const totalProducts = filteredInventory.length;
  const lowStockCount = filteredInventory.filter(product => product.quantity <= 10).length; // Customizable low stock threshold
  const averageProductPrice = totalProducts > 0 ? totalInventoryValue / filteredInventory.reduce((sum, product) => sum + product.quantity, 0) : 0;

  // fetch store inventory data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const inventoryData = await getAllProducts();
      setInventoryData(inventoryData);
      setFilteredInventory(inventoryData);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false); // Set loading to false *after* fetch completes (success or error)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Inventory based on search query and selected status
  useEffect(() => {
    const flteredBySearching = inventoryData.filter((inventory) => {
      const searchMatch = Object.values(inventory)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      //  const statusMatch =
      //    statusFilter === null ||
      //    (statusFilter.value === 'All' && statusFilter.label === 'All') ||
      //    order.fulfillmentStatus === statusFilter.value;
      // return searchMatch && statusMatch;
      return searchMatch;
    });

    setFilteredInventory(flteredBySearching);
  }, [searchQuery, statusFilter, inventoryData]);
  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleUpdateProduct = async (productId: string, newPrice: number) => {
    setInventoryData(
      inventoryData.map((product) =>
        product._id === productId ? { ...product, price: newPrice } : product
      )
    );
    setSuccessMessage('Price updated successfully');

    // TODO: update product to inventory as well
  };

  const handleCloseModal = () => {
    setSuccessMessage('');
    setIsModalOpen(false);
  };

  const handleSelectProduct = (product: ProductProps) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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
    const filtered = inventoryData.filter((inventory) => {
      const createdDate = inventory.createdAt; // YYYY-MM-DD format
      const isAfterStart = start ? createdDate >= start : true;
      const isBeforeEnd = end ? createdDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
    setFilteredInventory(filtered);
  };

  const clearFilters = () => {
    //  setStatusFilter({ value: 'All', label: 'All' });
    setStartDate('');
    setEndDate('');
    setFilteredInventory(inventoryData); // Reset to all inventory
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
    const sortedInventory = sortItems(
      filteredInventory,
      newSortColumn,
      newSortOrder
    );
    console.log(sortedInventory);
    setFilteredInventory(sortedInventory);
  };

  //for defining what table headers needed
  const handleUpdate = (rowData: ProductProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
    // window.location.href = `../inventory/update-product?_id=${rowData._id}`;
  };
  const handleSaveUpdatedRow = async (updatedRow: ProductProps) => {
    setIsUpdateModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFilteredInventory((prevInventory) =>
      prevInventory.filter((inventory) => inventory._id !== id)
    );
  };

  const handleDeleteClick = (rowData: ProductProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsDeleteModalOpen(true); // Open the modal
  };

  const handleConfirmDelete = async (id: string) => {
    //delete it from database -- though i dont't think we should delete products at all for future references
    try {
      await deleteProduct(id);
      setSuccessMessage(`Inventory item # ${id} deleted successfully.`);

      //Delete from table row
      setFilteredInventory((prevInventory) =>
        prevInventory.filter((inventory) => inventory._id !== id)
      );
    } catch (error) {
      //TODO: setErrorMessage?
      console.error(
        `Error deleting product with id ${id} from the database:`,
        error
      ); // Log the full error for debugging

      alert(`Error deleting product with id ${id} from the database.`);
    }
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
    if (selectedRows.length === filteredInventory.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredInventory.map((item) => item._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((id) => deleteProduct(id)));

      setFilteredInventory((prevInventory) =>
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
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <div className='max-w-7xl mx-auto'>
        <PageHeader
          heading='Inventory Management'
          actions={
            <div className='flex flex-wrap gap-2'>
              <Button
                icon={Download}
                buttonTitle='Export'
                buttonTitleClassName='hidden md:inline'
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2'
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log('Export inventory');
                }}
              />
              <Button
                isLoading={isLoading}
                icon={RotateCcw}
                buttonTitle='Refresh'
                buttonTitleClassName='hidden md:inline'
                loadingButtonTitle='Refreshing...'
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2'
                onClick={async () => {
                  await fetchData();
                }}
              />
              <Button
                icon={Plus}
                buttonTitle='Add Product'
                buttonTitleClassName='hidden md:inline'
                className='bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2'
                onClick={() => {
                  router.push('./inventory/new-product');
                }}
              />
            </div>
          }
        />

        {/* Modern Inventory Metrics Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <MetricCard
            title='Total Inventory Value'
            value={`$${formatPrice(totalInventoryValue)}`}
            icon={<DollarSign className='w-6 h-6' />}
            color='green'
            change={8}
            changeLabel='From last month'
          />
          <MetricCard
            title='Total Products'
            value={totalProducts}
            icon={<Package className='w-6 h-6' />}
            color='blue'
          />
          <MetricCard
            title='Low Stock Items'
            value={lowStockCount}
            icon={<AlertTriangle className='w-6 h-6' />}
            color='red'
            changeLabel='Items ≤ 10 qty'
          />
          <MetricCard
            title='Average Price'
            value={`$${formatPrice(averageProductPrice)}`}
            icon={<BarChart3 className='w-6 h-6' />}
            color='purple'
          />
        </div>

        {/* Enhanced Stock Status Filters */}
        <div className='mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-800 mb-3'>Quick Filters</h3>
          <div className='flex flex-wrap gap-2'>
            <button 
              onClick={() => setFilteredInventory(inventoryData)}
              className='px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200'
            >
              All Items ({inventoryData.length})
            </button>
            <button 
              onClick={() => setFilteredInventory(inventoryData.filter(p => p.quantity <= 10))}
              className='px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 flex items-center gap-1'
            >
              <AlertTriangle className='w-4 h-4' />
              Low Stock ({lowStockCount})
            </button>
            <button 
              onClick={() => setFilteredInventory(inventoryData.filter(p => p.quantity > 50))}
              className='px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200'
            >
              High Stock ({inventoryData.filter(p => p.quantity > 50).length})
            </button>
            <button 
              onClick={() => setFilteredInventory(inventoryData.filter(p => p.featured))}
              className='px-4 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors duration-200 flex items-center gap-1'
            >
              <Star className='w-4 h-4' />
              Featured ({inventoryData.filter(p => p.featured).length})
            </button>
          </div>
        </div>

        {/* Table Search field and Filter Dropdown*/}
        <TableFilters>
        <BulkDeleteButton
          onClick={() => setIsBulkDeleteModalOpen(true)}
          isDisabled={selectedRows.length === 0}
        />

        {/* TODO: Add filter by quantity status */}

        {/* Filter by dates */}
        {/* {showMoreFilters && ( */}
        <DateFilters
          label='Filter by Date Range'
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        {/* )} */}
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
          searchFieldPlaceholder='inventory products'
          onSearchChange={handleSearchChange}
        />

        {/* Enhanced Inventory Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table
          id='inventory-table'
          className='w-full text-sm text-left rtl:text-right text-vesoko_gray_600 dark:text-gray-400'
        >
          <TableHead
            checked={selectedRows.length === filteredInventory.length}
            onChange={handleSelectAllRows}
            columns={tableColumns}
            handleSort={handleSort}
          />
          {isLoading ? ( // Show loading indicator
            <Loading message='inventory products' />
          ) : filteredInventory.length === 0 ? (
            <p className='text-center'>No inventory products found</p>
          ) : (
            <tbody>
              {filteredInventory
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((product) => (
                  <TableRow
                    key={product._id}
                    rowData={product}
                    rowValues={[
                      {
                        content: (
                          <input
                            type='checkbox'
                            checked={selectedRows.includes(product._id)}
                            onChange={() => handleSelectRow(product._id)}
                          />
                        ),
                      },
                      { content: product._id },

                      {
                        content: (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={50} // Adjust the width as needed
                            height={50} // Adjust the height as needed
                            priority
                          />
                        ),
                      },
                      { content: product.title },
                      { content: product.quantity, isStock: true },
                      { content: `$${formatPrice(product.price)}` },
                      { content: formatDate(product.createdAt) },
                      { content: formatDate(product.updatedAt) },
                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                label: 'Update',
                                onClick: () => handleUpdate(product),
                                // href: `./inventory/update-product?_id=${product._id}`,
                              },
                              {
                                label: 'Delete',
                                onClick: () => handleDeleteClick(product),
                              },
                            ]}
                          />
                        ),
                      },
                    ]}
                    onUpdate={handleSaveUpdatedRow}
                    onDelete={handleDelete}
                  />
                ))}
            </tbody>
          )}
        </table>
        <Pagination
          data={filteredInventory}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
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
    </div>
  );
};

export default SellerInventory;
