import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import Pagination from '@/components/Table/Pagination';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import SearchField from '@/components/Table/SearchField';
import TableFilters from '@/components/Table/TableFilters';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import { handleError } from '@/utils/errorUtils';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { deleteProduct } from '@/utils/product/deleteProduct';
import { getAllProducts } from '@/utils/product/getAllProducts';
import { sortItems } from '@/utils/sortItems';
import { fetchSellerAnalytics, SellerAnalyticsData } from '@/utils/seller/sellerAnalytics';
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  Star,
  TrendingUp,
  Upload
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProductProps, stateProps } from '../../type';
import Loading from './Loaders/Loading';
import SuccessMessageModal from './SuccessMessageModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';

// interface SellerProductProps {
//   inventoryData: ProductProps[];
// }
const cfSellerInventory = () => {
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
  const PAGE_SIZE = 10; // Increased from 5 to 10 for better space utilization

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
  
  // Analytics data for top products
  const [analyticsData, setAnalyticsData] = useState<SellerAnalyticsData | null>(null);
  const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
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

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const sellerStoreId = storeInfo?._id || userInfo?.storeId?._id;
      const analytics = await fetchSellerAnalytics('30d', sellerStoreId);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAnalyticsData();
  }, [userInfo?._id, storeInfo?._id]);

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
    <div className='space-y-4'>
        {/* Compact Header */}
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-white/20'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-vesoko_primary mb-1'>
                📦 Inventory Management
              </h1>
              <p className='text-sm text-gray-600'>
                Manage your products and track stock levels
              </p>
            </div>
            
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => {
                  console.log('Export inventory');
                }}
                className='inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-vesoko_primary_dark text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md disabled:opacity-50'
              disabled={true} // Disable until export functionality is implemented
              >
                <Upload className='w-4 h-4' />
                <span className='hidden sm:inline'>Export</span>
              </button>
              
              <button
                onClick={async () => await fetchData()}
                disabled={isLoading}
                className='inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-vesoko_primary500 to-vesoko_primary_dark hover:from-vesoko_primary600 hover:to-vesoko_secondary text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md disabled:opacity-50'
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className='hidden sm:inline'>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <button
                onClick={() => router.push('./inventory/new-product')}
                className='inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark hover:from-vesoko_primary_2 hover:to-vesoko_secondary text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md'
              >
                <Plus className='w-4 h-4' />
                <span className='hidden sm:inline'>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Inventory Metrics Overview */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {[
            {
              title: 'Total Value',
              value: `$${formatPrice(totalInventoryValue)}`,
              icon: <DollarSign className='w-5 h-5' />,
              gradient: 'from-green-400 to-green-600',
              bgGradient: 'from-green-50 to-emerald-50',
              borderColor: 'border-green-200'
            },
            {
              title: 'Total Products',
              value: totalProducts,
              icon: <Package className='w-5 h-5' />,
              gradient: 'from-vesoko_primary400 to-vesoko_primary_dark',
              bgGradient: 'from-vesoko_primary50 to-cyan-50',
              borderColor: 'border-blue-200'
            },
            {
              title: 'Low Stock',
              value: lowStockCount,
              icon: <AlertTriangle className='w-5 h-5' />,
              gradient: 'from-red-400 to-red-600',
              bgGradient: 'from-red-50 to-orange-50',
              borderColor: 'border-red-200'
            },
            {
              title: 'Avg Price',
              value: `$${formatPrice(averageProductPrice)}`,
              icon: <BarChart3 className='w-5 h-5' />,
              gradient: 'from-purple-400 to-purple-600',
              bgGradient: 'from-purple-50 to-indigo-50',
              borderColor: 'border-purple-200'
            }
          ].map((metric, index) => (
            <div
              key={metric.title}
              className={`bg-gradient-to-r ${metric.bgGradient} border ${metric.borderColor} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200`}
            >
              <div className='flex items-center justify-between mb-2'>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${metric.gradient} flex items-center justify-center text-white shadow-md`}>
                  {metric.icon}
                </div>
                {metric.title === 'Total Value' && (
                  <div className='flex items-center gap-1 text-xs font-medium text-green-600'>
                    <TrendingUp className='w-3 h-3' />
                    +8%
                  </div>
                )}
              </div>
              <div>
                <div className='text-lg font-bold text-gray-900 mb-1'>
                  {metric.value}
                </div>
                <div className='text-xs font-medium text-gray-600'>
                  {metric.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Quick Filters */}
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-white/20'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-vesoko_primary to-vesoko_primary_dark flex items-center justify-center'>
              <ShoppingBag className='w-4 h-4 text-white' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900'>Quick Filters</h3>
          </div>
          
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
            {[
              {
                label: 'All Items',
                count: inventoryData.length,
                onClick: () => setFilteredInventory(inventoryData),
                gradient: 'from-gray-400 to-gray-500',
                hoverGradient: 'hover:from-gray-500 hover:to-gray-600',
                icon: <Package className='w-4 h-4' />
              },
              {
                label: 'Low Stock',
                count: lowStockCount,
                onClick: () => setFilteredInventory(inventoryData.filter(p => p.quantity <= 10)),
                gradient: 'from-red-400 to-red-500',
                hoverGradient: 'hover:from-red-500 hover:to-red-600',
                icon: <AlertTriangle className='w-4 h-4' />
              },
              {
                label: 'High Stock',
                count: inventoryData.filter(p => p.quantity > 50).length,
                onClick: () => setFilteredInventory(inventoryData.filter(p => p.quantity > 50)),
                gradient: 'from-green-400 to-green-500',
                hoverGradient: 'hover:from-green-500 hover:to-green-600',
                icon: <TrendingUp className='w-4 h-4' />
              },
              {
                label: 'Top Products',
                count: analyticsData?.topProducts?.length || 0,
                onClick: () => {
                  if (analyticsData?.topProducts) {
                    const topProductIds = analyticsData.topProducts.map(p => p.id);
                    setFilteredInventory(inventoryData.filter(p => topProductIds.includes(p._id)));
                  }
                },
                gradient: 'from-purple-400 to-purple-500',
                hoverGradient: 'hover:from-purple-500 hover:to-purple-600',
                icon: <Star className='w-4 h-4' />
              },
              {
                label: 'Featured',
                count: inventoryData.filter(p => p.featured).length,
                onClick: () => setFilteredInventory(inventoryData.filter(p => p.featured)),
                gradient: 'from-yellow-400 to-orange-500',
                hoverGradient: 'hover:from-yellow-500 hover:to-orange-600',
                icon: <Star className='w-4 h-4' />
              }
            ].map((filter, index) => (
              <button
                key={filter.label}
                onClick={filter.onClick}
                className={`group bg-gradient-to-r ${filter.gradient} ${filter.hoverGradient} text-white rounded-lg p-3 transition-all duration-200 hover:shadow-md`}
              >
                <div className='flex flex-col items-center space-y-1'>
                  <div className='w-6 h-6 bg-white/20 rounded-md flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200'>
                    {filter.icon}
                  </div>
                  <div className='text-center'>
                    <div className='text-sm font-bold'>{filter.count}</div>
                    <div className='text-xs font-medium opacity-90'>{filter.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Products Section */}
        {analyticsData?.topProducts && analyticsData.topProducts.length > 0 && (
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-white/20'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center'>
                <Star className='w-4 h-4 text-white' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>🏆 Top Selling Products</h3>
              <div className='ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                Last 30 days
              </div>
            </div>
            
            <div className='space-y-3'>
              {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className='group flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-vesoko_primary hover:shadow-md transition-all duration-200'>
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-vesoko_primary400 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className='absolute -top-1 -right-1 w-3 h-3 bg-vesoko_primary rounded-full flex items-center justify-center'>
                          <Star className='w-1.5 h-1.5 text-white' />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900 group-hover:text-vesoko_primary transition-colors text-sm'>
                        {product.name}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {product.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-vesoko_primary'>
                      ${product.revenue.toFixed(2)}
                    </p>
                    <p className='text-xs text-gray-500'>revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
          className='hidden sm:inline text-sm text-vesoko_primary underline'
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

        {/* Modern Inventory Table */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-slide-up' style={{animationDelay: '600ms'}}>
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
  );
};

export default SellerInventory;
