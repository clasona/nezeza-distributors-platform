import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
// import { ProductProps } from '../../type';
import { fetchInventory } from '../utils/fetchInventory';
import { ProductProps } from '../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';

const WholesalerInventory = () => {
  const [existingInventory, setExistingInventory] = useState<ProductProps[]>([]); //TODO: change to InventoryProps 
  const [isModalOpen, setIsModalOpen] = useState(false);
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
            product.id === productId ? { ...product, price: newPrice } : product
          )
    );
    setSuccessMessage('Price updated successfully');

    setNewProductPrice(0);

      
    // try {
      // const response = await axios.post(
      //   `http://localhost:8000/api/v1/inventory/`, //TODO: replace with updateInventory 
      //   {
      //     price: newProductPrice,
      //     // Add other product properties as needed
      //   }
      // );

  //     if (response.status === 201) {
  //       console.log(response.data);
  //       setErrorMessage(''); // Clear any previous error message
  //       setSuccessMessage('Product created successfully');
  //       console.log('Product created successfully');
  //       // Optimistic update (optional): Add the new product to the local state or redux persist
  //       setExistingInventory(
  //         existingInventory.map((product) =>
  //           product.id === productId ? { ...product, price: newPrice } : product
  //         )
  //       );
  //       handleCloseModal; //to close the form - NOT WORKING, maybe use setIsModalOpen(false);
  //     } else {
  //       setSuccessMessage(''); // Clear any previous error message
  //       setErrorMessage(response.data);
  //       console.error('Error creating product:', response.data);
  //       // Handle specific error messages from the backend if applicable
  //     }
  //   } catch (error) {
  //     console.error('Error creating product:', error);
  //   }
  };

  // const handleRemoveProduct = async (productIdToDelete: Number) => {
  //   // const productIdToDelete = '673c195619ad4e8efaad11ba';
  //   const manufacturerId = '673c171bfd6cd3ad5f89ab06';
  //   try {
  //     const response = await axios.delete(
  //       `http://localhost:8000/api/v1/manufacturers/${manufacturerId}/products/${productIdToDelete}`
  //       // {
  //       //   params: {
  //       //     manufacturerId: '673c171bfd6cd3ad5f89ab06',
  //       //     id: '673d675c938ed942121297c7',
  //       //   },
  //       // }
  //     );

  //     if (response.status === 200) {
  //       console.log(response.data);
  //       setErrorMessage(''); // Clear any previous error message
  //       setSuccessMessage('Product deleted successfully');
  //       console.log('Product deleted successfully');
  //       // Optimistic update (optional): Add the new product to the local state or redux persist
  //       setExistingProducts(
  //         existingProducts.filter((product) => product.id !== productIdToDelete)
  //       );
  //       setSuccessMessage('');

  //       handleCloseModal; //to close the form - NOT WORKING, maybe use setIsModalOpen(false);
  //     } else {
  //       setSuccessMessage(''); // Clear any previous error message
  //       setErrorMessage(response.data);
  //       console.error('Error deleting product:', response.data);
  //       // Handle specific error messages from the backend if applicable
  //     }
  //   } catch (error) {
  //     console.error('Error deleting product:', error);
  //   }
  // };

  const handleCloseModal = () => {
    setSuccessMessage('');
    setIsModalOpen(false);
  };



  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
        Wholesaler Store Name's Inventory
      </h2>
      {/* <button
        className='bg-nezeza_dark_blue text-white px-4 py-1 rounded-md hover:bg-nezeza_yellow hover:text-black'
        onClick={() => setIsModalOpen(true)}
      >
        Create New Product
      </button>
      {successMessage && (
        <p className='text-center text-green-500'>{successMessage}</p>
      )} */}

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='w-4/5 bg-white p-6 rounded-lg'>
            <h2 className='text-xl font-bold mb-4'>
              Enter Updated Product Details
            </h2>
            {existingInventory.map((product: ProductProps) => (
              <form
                key={product.id}
                className=''
                onSubmit={(e) => e.preventDefault()}
              >
                <div className='mb-2 '>
                  <label className='text-gray-600 text-sm w-24'>
                    New Price
                  </label>
                  <input
                    type='number'
                    placeholder='Enter New Product Price'
                    value={newProductPrice}
                    className='ml-3 max-w-screen-sm px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    required
                  />
                </div>

                <button
                  className='mt-4 bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700'
                  type='button'
                  onClick={() =>
                    handleUpdateProduct(product.id, newProductPrice)
                  } //get id from product
                >
                  Update Product
                </button>

                {successMessage && (
                  <p className='mt-4 text-center text-green-500'>
                    {successMessage}
                  </p>
                )}
              </form>
            ))}
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
            {existingInventory.map((product: ProductProps) => (
              <tr
                key={product.id}
                className=' border-b border-nezeza_light dark:border-white/10 hover:bg-nezeza_light_blue'
                // onClick={() => setIsOptionsOpen(true)}
              >
                {/* <td className='border border-slate-600'>{id}</td> */}
                <td className='px-6 py-2 font-medium'>{product.id}</td>
                <td className='px-6 py-2 '>{product.title}</td>
                <td className='px-6 py-2 '>{product.price}</td>
                <td className='px-6 py-2 '>{product.description}</td>
                <td className='px-6 py-2 '>{product.category}</td>
                {/* <td className='border border-slate-600'>{storeId}</td> */}
                <td className='px-6 py-2 '>{product.image}</td>

                {/* <td className=''>
                  <button
                    className='bg-nezeza_light text-white px-4 rounded-md hover:bg-nezeza_light'
                    type='button'
                    onClick={() => handleUpdateProduct(product.price)}
                  >
                    Update
                  </button>
                </td> */}
                <td>
                  {/* <input type="number" value={product.price} onChange={(e) => setNewProductPrice(Number(e.target.value))} /> */}
                  <button
                    className='bg-nezeza_light text-white px-4 rounded-md hover:bg-nezeza_light'
                    type='button'
                    // onClick={() => handleUpdateProduct(product.id, product.price)}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Update
                  </button>
                  {successMessage && (
                    <p className='mt-4 text-center text-green-500'>
                      {successMessage}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WholesalerInventory;
