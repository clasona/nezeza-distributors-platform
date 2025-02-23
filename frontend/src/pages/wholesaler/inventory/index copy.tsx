import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
import { fetchInventory } from '../../../utils/inventory/fetchInventory';
import { InventoryProps, ProductProps, stateProps } from '../../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';
import WholesalerLayout from '../layout';
import Heading from '@/components/Heading';
import PageHeader from '@/components/PageHeader';
import TableActions from '@/components/Table/TableActions';
import TableRow from '@/components/Table/TableRow';
import TableHead from '@/components/Table/TableHead';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import Image from 'next/image';
import Pagination from '@/components/Table/Pagination';
import mockProducts from '../mock-data/mockProducts';
import mockInventory from '../mock-data/mockInventory';
import TableFilters from '@/components/Table/TableFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import SearchField from '@/components/Table/SearchField';
import { sortItems } from '@/utils/sortItems';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import RemoveRowModal from '@/components/Table/DeleteRowModal';
import { FaProductHunt } from 'react-icons/fa';
import formatPrice from '@/utils/formatPrice';
import formatDate from '@/utils/formatDate';
import PageHeaderLink from '@/components/PageHeaderLink';
import DateFilters from '@/components/Table/Filters/DateFilters';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import { useSelector } from 'react-redux';
import { formatIdByShortening, formatIdByTimestamp } from '@/utils/formatId';

const WholesalerInventory = () => {
  const [inventoryData, setInventoryData] = useState<InventoryProps[]>([]);
  const [sampleInventory, setSampleInventory] = useState<InventoryProps[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryProps[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(
    null
  );
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStoreId, setNewProductStoreId] = useState(0); //must get from current logged in
  const [newProductImage, setNewProductImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //for defining what table headers needed
  const tableColumns = [
    { title: 'Select', srOnly: true, id: 'select' },
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const [currentRowData, setCurrentRowData] = useState<InventoryProps>({
    _id: 0,
    title: '',
    description: '',
    image: '',
    owner: 0,
    buyerStoreId: 0,
    productId: 0,
    quantity: 0,
    price: 0,
    freeShipping: false,
    availability: false,
    averageRating: 0,
    numOfReviews: 0,
    lastUpdated: '',
    createdAt: '',
    updatedAt: '',
  });

  // get store info from redux
  const { storeInfo } = useSelector((state: stateProps) => state.next);

  // fetch store inventory data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryData = await fetchInventory(storeInfo);
        setInventoryData(inventoryData);
        setFilteredInventory(inventoryData);

        //sample inventory
        // const sampleInventoryData = mockInventory;
        // setSampleInventory(sampleInventoryData);
        // setFilteredInventory(sampleInventoryData); // Initially show all inventory
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter Inventory based on search query and selected status
  useEffect(() => {
    const flteredBySearching = inventoryData.filter((inventory) => {
      const searchMatch = Object.values(inventory)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // const statusMatch =
      // statusFilter === 'Status' || inventory.fulfillmentStatus === statusFilter;
      // return searchMatch && statusMatch;
      return searchMatch;
    });

    setFilteredInventory(flteredBySearching);
  }, [searchQuery, statusFilter, inventoryData]);
  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleUpdateProduct = async (productId: number, newPrice: number) => {
    setInventoryData(
      inventoryData.map((product) =>
        product._id === productId ? { ...product, price: newPrice } : product
      )
    );
    setSuccessMessage('Price updated successfully');

    setNewProductPrice(0);

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
    // setStatusFilter('Status');
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
  const handleUpdate = (rowData: InventoryProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
  };
  const handleSaveUpdatedRow = (updatedRow: InventoryProps) => {
    // Update filteredInventorys to reflect the updated row
    setFilteredInventory((prevProduct) =>
      prevProduct.map((product) =>
        product._id === updatedRow._id ? { ...product, ...updatedRow } : product
      )
    );
    setSuccessMessage(
      `Inventory item # ${updatedRow._id} updated successfully.`
    );
    setIsUpdateModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleRemove = (id: number) => {
    setFilteredInventory((prevInventory) =>
      prevInventory.filter((inventory) => inventory._id !== id)
    );
  };

  const handleRemoveClick = (rowData: InventoryProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsRemoveModalOpen(true); // Open the modal
  };

  const handleConfirmRemove = (id: number) => {
    setFilteredInventory((prevInventory) =>
      prevInventory.filter((inventory) => inventory._id !== id)
    );

    setSuccessMessage(`Inventory item # ${id} deleted successfully.`);
    //TODO: Remove from database
    setIsRemoveModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <WholesalerLayout>
      <div>
        <PageHeader
          heading='Inventory'
          extraComponent={
            <PageHeaderLink
              linkTitle={'Add New Product to Inventory'}
              href={'./inventory/new-product'}
            />
          }
        />
        {/* <TableActions /> */}

        {/* Table Search field and Filter Dropdown*/}
        <TableFilters>
          <SearchField
            searchFieldPlaceholder='inventory products'
            onSearchChange={handleSearchChange}
          />
          {/* TODO: Add filter by quantity status */}
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
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table
            id='inventory-table'
            className='w-full text-sm text-left rtl:text-right text-nezeza_gray_600 dark:text-gray-400'
          >
            <TableHead columns={tableColumns} handleSort={handleSort} />
            <tbody>
              {filteredInventory
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((product) => (
                  <TableRow
                    key={product._id}
                    rowData={product}
                    rowValues={[
                      { content: <input type='checkbox' /> },
                      { content: formatIdByShortening(product._id) },

                      {
                        content: (
                          <Image
                            src={product.image}
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
                              },
                              {
                                label: 'Remove',
                                onClick: () => handleRemoveClick(product),
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
            </tbody>
          </table>
          <Pagination
            data={filteredInventory}
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

WholesalerInventory.noLayout = true;
export default WholesalerInventory;
