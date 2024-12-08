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



const WholesalerInventory = () => {
  const [existingInventory, setExistingInventory] = useState<ProductProps[]>([]);
  const [sampleInventory, setSampleInventory] = useState<InventoryProps[]>([]);

  const [filteredInventory, setFilteredInventory] = useState<InventoryProps[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStoreId, setNewProductStoreId] = useState(0); //must get from current logged in
  const [newProductImage, setNewProductImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    { title: 'Qty', id: 'quantity', sortable: true },
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
    setFilteredInventory(sortedInventory);
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
            className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'
          >
            <TableHead columns={tableColumns} handleSort={handleSort} />
            <tbody>
              {filteredInventory
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((product) => (
                  <TableRow
                    key={product._id}
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
                      { content: product.stock },
                      { content: `$${product.price.toFixed(2)}` },
                      { content: product.createdAt },
                      { content: product.updatedAt },
                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              { href: './Inventory/new', label: 'Remove' },
                              { href: '#', label: 'Update' },
                            ]}
                          />
                        ),
                      },
                    ]}
                  />
                ))}
            </tbody>
          </table>
          <Pagination
            data={filteredInventory}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </WholesalerLayout>
  );
};

WholesalerInventory.noLayout = true;
export default WholesalerInventory;
