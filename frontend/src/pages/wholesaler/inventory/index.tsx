import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
import { fetchInventory } from '../../utils/fetchInventory';
import { InventoryProps, ProductProps } from '../../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';
import WholesalerLayout from '../index';
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
import { sortItems } from '@/pages/utils/sortItems';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import RemoveRowModal from '@/components/Table/RemoveRowModal';
import { FaProductHunt } from 'react-icons/fa';
import formatPrice from '@/pages/utils/formatPrice';

const WholesalerInventory = () => {
  const [existingInventory, setExistingInventory] = useState<ProductProps[]>(
    []
  );
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
  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const inventoryData = await fetchInventory();
        // setExistingInventory(inventoryData);
        //sample inventory
        const sampleInventoryData = mockInventory;
        setSampleInventory(sampleInventoryData);
        setFilteredInventory(sampleInventoryData); // Initially show all inventory
      } catch (error) {
        console.error('Error fetching existing inventory data:', error);
      }
    };

    fetchData();
  }, []);
  // Filter Inventory based on search query and selected status
  useEffect(() => {
    const flteredBySearching = sampleInventory.filter((inventory) => {
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
  }, [searchQuery, statusFilter, sampleInventory]);
  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleUpdateProduct = async (productId: number, newPrice: number) => {
    setExistingInventory(
      existingInventory.map((product) =>
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

  const tableColumns = [
    { title: 'Select', srOnly: true, id: 'select' },
    { title: 'ID', id: '_id', sortable: true },
    { title: 'Image', id: 'image' },
    { title: 'Title', id: 'title', sortable: true },
    { title: 'Qty', id: 'stock', sortable: true },
    { title: 'Price', id: 'price', sortable: true },
    { title: 'Created', id: 'createdAt', sortable: true },
    { title: 'Updated', id: 'updatedAt', sortable: true },
    { title: 'Action', id: 'action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Adjust the page size as needed. useState() instead??

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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [currentRowData, setCurrentRowData] = useState<InventoryProps>({
    _id: 0,
    title: '',
    description: '',
    image: '',
    owner: 0,
    buyerStoreId: 0,
    productId: 0,
    stock: 0,
    price: 0,
    freeShipping: false,
    availability: false,
    averageRating: 0,
    numOfReviews: 0,
    lastUpdated: '',
    createdAt: '',
    updatedAt: '',
  });

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
    // Show success message
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
    //TODO: Remove from database

    // Show success message
    setSuccessMessage(`Inventory item # ${id} deleted successfully.`);
    setIsRemoveModalOpen(false); // Close the modal after deletion
    // Clear the message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <WholesalerLayout>
      <div>
        {/* Header */}
        <PageHeader
          heading='Inventory'
          href='./inventory/new-inventory'
          linkTitle='Add New Product to Inventory'
        />
        {/* <TableActions /> */}

        {/* Table Search field and Filter Dropdown*/}
        <TableFilters>
          <SearchField
            searchFieldPlaceholder='inventory products'
            onSearchChange={handleSearchChange}
          />
          {/*TODO: Add filter by stock status */}
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
                      { content: product._id },

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
                      { content: product.stock, isStock: true },
                      { content: `$${formatPrice(product.price)}` },
                      { content: product.createdAt },
                      { content: product.updatedAt },
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
