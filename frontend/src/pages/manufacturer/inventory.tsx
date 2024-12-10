import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
// import { ProductProps } from '../../type';
import { fetchProducts } from '../utils/fetchProducts';
import { ProductProps } from '../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';

const ManufacturerInventory = () => {
  const [existingProducts, setExistingProducts] = useState<ProductProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductQuantity, setNewProductQuantity] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStoreId, setNewProductStoreId] = useState(0); //must get from current logged in
  const [newProductImage, setNewProductImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await fetchProducts();
        setExistingProducts(productsData);
        console.log('existing products fetched successfully.');
      } catch (error) {
        console.error('Error fetching existing products data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCreateProduct = async () => {
    if (
      !newProductTitle ||
      !newProductPrice ||
      !newProductDescription ||
      !newProductCategory ||
      !newProductStoreId ||
      !newProductImage
    ) {
      setSuccessMessage(''); // Clear any previous error message
      setErrorMessage('Please fill all the required new product details.');
      console.error('Please fill all the required new product details.');
      return; // Prevent creating empty product
    }
    try {
      const manufacturerId = '673c171bfd6cd3ad5f89ab06';
      const response = await axios.post(
        `http://localhost:8000/api/v1/manufacturers/${manufacturerId}/products`,
        {
          title: newProductTitle,
          price: newProductPrice,
          description: newProductDescription,
          category: newProductCategory,
          //   storeId: newProductStoreId,
          image: newProductImage,
          // Add other product properties as needed
        }
      );

      if (response.status === 201) {
        console.log(response.data);
        setErrorMessage(''); // Clear any previous error message
        setSuccessMessage('Product created successfully');
        console.log('Product created successfully');
        // Optimistic update (optional): Add the new product to the local state or redux persist
        setExistingProducts([
          ...existingProducts,
          {
            _id: response.data.product._id,
            title: newProductTitle,
            price: newProductPrice,
            quantity: newProductQuantity,
            description: newProductDescription,
            category: newProductCategory,
            // storeId: newProductStoreId,
            image: newProductImage,
          }, // Adjust based on actual response data
        ]); // Adjust based on actual response data
        // You might want to fetch the updated product list here to reflect changes
        // in the UI more accurately

        // Clear the form fields

        setNewProductTitle('');
        setNewProductPrice(0);
        setNewProductDescription('');
        setNewProductCategory('');
        setNewProductStoreId(0);
        setNewProductImage('');

        handleCloseModal; //to close the form - NOT WORKING, maybe use setIsModalOpen(false);
      } else {
        setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(response.data);
        console.error('Error creating product:', response.data);
        // Handle specific error messages from the backend if applicable
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDeleteProduct = async (productIdToDelete: Number) => {
    // const productIdToDelete = '673c195619ad4e8efaad11ba';
    const manufacturerId = '673c171bfd6cd3ad5f89ab06';
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/manufacturers/${manufacturerId}/products/${productIdToDelete}`
        // {
        //   params: {
        //     manufacturerId: '673c171bfd6cd3ad5f89ab06',
        //     id: '673d675c938ed942121297c7',
        //   },
        // }
      );

      if (response.status === 200) {
        console.log(response.data);
        setErrorMessage(''); // Clear any previous error message
        setSuccessMessage('Product deleted successfully');
        console.log('Product deleted successfully');
        // Optimistic update (optional): Add the new product to the local state or redux persist
        setExistingProducts(
          existingProducts.filter(
            (product) => product._id !== productIdToDelete
          )
        );
        setSuccessMessage('');

        handleCloseModal; //to close the form - NOT WORKING, maybe use setIsModalOpen(false);
      } else {
        setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(response.data);
        console.error('Error deleting product:', response.data);
        // Handle specific error messages from the backend if applicable
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCloseModal = () => {
    setSuccessMessage('');
    setIsModalOpen(false);
  };

  const handleOptionsModal = () => {
    // setSuccessMessage('');
    setIsOptionsOpen(false);
  };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
        Manufacturer Store Name's Inventory
      </h2>
      <button
        className='bg-nezeza_dark_blue text-white px-4 py-1 rounded-md hover:bg-nezeza_yellow hover:text-black'
        onClick={() => setIsModalOpen(true)}
      >
        Create New Product
      </button>
      {successMessage && (
        <p className='text-center text-nezeza_green_600'>{successMessage}</p>
      )}

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='w-4/5 bg-white p-6 rounded-lg'>
            <h2 className='text-xl font-bold mb-4'>
              Enter New Product Details
            </h2>

            <form className='' onSubmit={(e) => e.preventDefault()}>
              <div className='mb-2 grid grid-cols-2 '>
                <input
                  type='text'
                  placeholder='Product Title'
                  value={newProductTitle}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  required
                />
                <input
                  type='number'
                  placeholder='Product Price'
                  value={newProductPrice}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div className='mb-2 grid grid-cols-2 '>
                <textarea
                  placeholder='Product Description'
                  value={newProductDescription}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  required
                />
                <input
                  type='number'
                  placeholder='Product Quantity'
                  value={newProductQuantity}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) =>
                    setNewProductQuantity(Number(e.target.value))
                  }
                  required
                />
              </div>
              <div className='mb-2 grid grid-cols-2 '>
                <input
                  type='text'
                  placeholder='Product Category'
                  value={newProductCategory}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  required
                />
                <input
                  type='text'
                  placeholder='Product Store ID'
                  value={newProductStoreId}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductStoreId(Number(e.target.value))}
                  required
                />
              </div>
              <div className='mb-2 grid grid-cols-2 '>
                <input
                  type='text'
                  placeholder='Product Image'
                  value={newProductImage}
                  className='max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  onChange={(e) => setNewProductImage(e.target.value)}
                  required
                />
                {/* <select
                  className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  required
                >
                  <option value=''>Select Product Image</option>
                  <option value=''>
                    https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png
                  </option>
                  <option value=''>
                    https://nezeza-products.s3.us-east-2.amazonaws.com/akanozo.png
                  </option>
                  <option value=''>
                    https://nezeza-products.s3.us-east-2.amazonaws.com/akarabo.png
                  </option>
                  <option value=''>
                    https://nezeza-products.s3.us-east-2.amazonaws.com/kinazi.png
                  </option>
                </select> */}
              </div>

              <button
                className='mt-4 bg-nezeza_green_600  text-white px-4 py-1 rounded-md hover:bg-green-700'
                type='button'
                onClick={handleCreateProduct}
              >
                Create Product
              </button>
              {successMessage && (
                <p className='mt-4 text-center text-nezeza_green_600'>
                  {successMessage}
                </p>
              )}
            </form>
            <button
              className='flex  mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'
              onClick={handleCloseModal}
            >
              <MdClose className='text-2xl text-gray-600 group-hover:text-white ' />
              <h3 className='text-base text-gray-800 group-hover:text-white font-semibold'>
                Close
              </h3>
            </button>
          </div>
        </div>
      )}

      <div className='py-4'>
        <table className=' w-full table-auto border-collapse border border-slate-500 shadow-xl'>
          {/* <thead className=' hover:bg-nezeza_light_blue'> */}
          <thead className='hover:bg-nezeza_dark_blue border-b border-neutral-200 bg-nezeza_light font-medium text-white dark:border-white/10'>
            <tr>
              {/* <th className='border border-slate-600'>ID</th> */}
              <th scope='col' className='px-6 py-2'>
                Product ID
              </th>
              <th className='border border-slate-600'>Title</th>
              <th className='border border-slate-600'>Price</th>
              <th className='border border-slate-600'>Description</th>
              <th className='border border-slate-600'>Category</th>
              {/* <th className='border border-slate-600'>Store ID</th> */}
              <th className='border border-slate-600'>Image</th>
              <th className='border border-slate-600'>Actions</th>
              <th className='border border-slate-600'></th>
              {/* Add more accordingly */}
            </tr>
          </thead>
          {/* TODO: add storeId field */}
          <tbody>
            {existingProducts.map((product: ProductProps) => (
              <tr
                key={product._id}
                className=' border-b border-nezeza_light dark:border-white/10 hover:bg-nezeza_light_blue'
                // onClick={() => setIsOptionsOpen(true)}
              >
                {/* <td className='border border-slate-600'>{id}</td> */}
                <td className='px-6 py-2 font-medium'>{product._id}</td>
                <td className='px-6 py-2 '>{product.title}</td>
                <td className='px-6 py-2 '>{product.price}</td>
                <td className='px-6 py-2 '>{product.description}</td>
                <td className='px-6 py-2 '>{product.category}</td>
                {/* <td className='border border-slate-600'>{storeId}</td> */}
                <td className='px-6 py-2 '>{product.image}</td>
                <td className=''>
                  <button
                    className='bg-red-600 text-white px-4 rounded-md hover:bg-red-700'
                    type='button'
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </td>
                <td className=''>
                  <button
                    className='bg-nezeza_light text-white px-4 rounded-md hover:bg-nezeza_light'
                    type='button'
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManufacturerInventory;
