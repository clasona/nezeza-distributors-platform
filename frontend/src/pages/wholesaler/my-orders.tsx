import React, { useState, useEffect } from 'react';
import Products from '@/components/Products';
// import { ProductProps } from '../../type';
import { fetchOrders } from '../utils/fetchOrders';
import { OrderProps } from '../../../type';
import axios from 'axios';
import { MdClose } from 'react-icons/md';

const WholesalerMyOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>(
    []
  );
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
          const ordersData = await fetchOrders();
          console.log(ordersData);
        setExistingOrders(ordersData);
      } catch (error) {
        console.error('Error fetching existing orders data:', error);
      }
    };

    fetchData();
  }, []);

  
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

//   const handleCloseModal = () => {
//     setSuccessMessage('');
//     setIsModalOpen(false);
//   };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
        Wholesaler Store Name's Orders
      </h2>

      <div className='py-4'>
        <table className=' w-full border-collapse border border-slate-500 shadow-xl'>
          {/* <thead className=' hover:bg-nezeza_light_blue'> */}
          <thead className='hover:bg-nezeza_dark_blue border-b border-neutral-200 bg-nezeza_light font-medium text-white dark:border-white/10'>
            <tr>
              {/* <th className='border border-slate-600'>ID</th> */}
              <th scope='col' className='px-6 py-2'>
                Order Date
              </th>
              <th scope='col' className='px-6 py-2'>
                Order ID
              </th>
              <th className='border border-slate-600'>Title</th>
              <th className='border border-slate-600'>Price</th>
              <th className='border border-slate-600'>Quantity</th>
              <th className='border border-slate-600'>Description</th>
              <th className='border border-slate-600'>Category</th>
              <th className='border border-slate-600'>Image</th>
              <th className='border border-slate-600'>Tax</th>
              <th className='border border-slate-600'>Shipping Fee</th>
              <th className='border border-slate-600'>Payment Method</th>
              <th className='border border-slate-600'>Status</th>
              <th className='border border-slate-600'></th>
              {/* Add more accordingly */}
            </tr>
          </thead>
          {/* TODO: add storeId field */}
          <tbody>
            {existingOrders.map((order: OrderProps) => (
              <tr
                key={order.id}
                className=' border-b border-nezeza_light dark:border-white/10 hover:bg-nezeza_light_blue'
                // onClick={() => setIsOptionsOpen(true)}
              >
                <td className='px-6 py-2 font-medium'>new Date()</td>{' '}
                {/*replace with actual order date*/}
                <td className='px-6 py-2 '>{order.id}</td>
                <td className='px-6 py-2 '>{order.items[0].title}</td>
                <td className='px-6 py-2 '>{order.items[0].price}</td>
                <td className='px-6 py-2 '>{order.quantity}</td>
                <td className='px-6 py-2 '>{order.items[0].description}</td>
                <td className='px-6 py-2 '>{order.items[0].category}</td>
                <td className='px-6 py-2 '>{order.items[0].image}</td>
                <td className='px-6 py-2 '>{order.tax}</td>
                <td className='px-6 py-2 '>{order.shippingFee}</td>
                <td className='px-6 py-2 '>{order.paymentMethod}</td>
                <td className='px-6 py-2 '>Pending</td>
                <td className='px-6 py-2 '></td>
                <td>
                  {/* <input type="number" value={product.price} onChange={(e) => setNewProductPrice(Number(e.target.value))} /> */}
                  <button
                    className='bg-nezeza_light text-white px-4 rounded-md hover:bg-nezeza_light'
                    type='button'
                    // onClick={() => handleUpdateProduct(product.id, product.price)}
                    // onClick={() => setIsModalOpen(true)}
                  >
                    Add to Inventory
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

export default WholesalerMyOrders;
