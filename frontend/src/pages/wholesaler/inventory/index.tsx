import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
import { fetchInventory } from '../../utils/fetchInventory';
import { ProductProps } from '../../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';
import WholesalerLayout from '..';
import Heading from '@/components/Heading';
import PageHeader from '@/components/PageHeader';
import TableActions from '@/components/Table/TableActions';
import TableRow from '@/components/Table/TableRow';
import TableHead from '@/components/Table/TableHead';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import Image from 'next/image';
import Pagination from '@/components/Table/Pagination';
import mockProducts from '../mock-data/mockProducts';


const WholesalerInventory = () => {
  const [existingInventory, setExistingInventory] = useState<ProductProps[]>(
    []
  ); //TODO: change to InventoryProps
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
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryData = await fetchInventory();
        setExistingInventory(inventoryData);
      } catch (error) {
        console.error('Error fetching existing inventory data:', error);
      }
    };

    fetchData();
  }, []);

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

  //sample products
  const sampleProducts = mockProducts;

  const tableColumns = [
    { title: 'Select', srOnly: true },
    { title: 'Image' },
    { title: 'Title' },
    { title: 'Qty' },
    { title: 'Price' },
    { title: 'Action' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 2; // Adjust the page size as needed

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        {/* Table Actions */}
        {/* Export \\ Search \\ Delete bulk */}
        <TableActions />

        {/* Table */}
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
            {/* Rest of your table code */}
            <TableHead columns={tableColumns} />

            <tbody>
              {sampleProducts
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((product) => (
                  <TableRow
                    key={product._id} // Important for performance
                    rowValues={[
                      { content: <input type='checkbox' /> }, // Assuming you want a checkbox
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
                      { content: product.quantity },
                      { content: `$${product.price.toFixed(2)}` },
                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              { href: './orders/new', label: 'Remove' },
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
            data={sampleProducts}
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
