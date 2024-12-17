import React, { useState, useEffect } from 'react';
import { resetCart } from '@/store/nextSlice';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { StoreProduct, stateProps } from '../../type';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const { productData, userInfo } = useSelector(
    //add orderData
    (state: stateProps) => state.next
  );

  useEffect(() => {
    const saveOrder = async () => {
      // save the cart products to our orders
      try {
        const response = await axios.post(
          `http://localhost:8000/api/v1/orders`,
          {
            items: productData,
            tax: 50,
            shippingFee: 10,
            paymentMethod: 'card',
          }
        );

        if (response.status === 200) {
          console.log('order saved successfully.');
          // console.log(productsData);
        } else {
          console.log('order not saved.');
          // console.log(productsData);
          return response.data;
          // return { props: { productsData } };
        }
      } catch (error) {
        console.error('Error saving order data:', error);
      }
    };
    saveOrder();
    dispatch(resetCart()); // Clear the cart
  }, []); // Empty dependency array to run only once after mount

  return (
    <div className='flex flex-col gap-2 items-center justify-center py-20'>
      <h1 className='text-2xl text-hoverBg font-semibold'>
        Thank you for shopping with Nezeza!
      </h1>
      <Link
        className='text-lg text-nezeza_gray_600 hover:underline underline-offset-4 decoration-[1px] hover:text-blue-600 duration-300'
        href={'/'}
        onClick={() => dispatch(resetCart())}
      >
        <p>Continue Shopping</p>
      </Link>
    </div>
  );
};

export default SuccessPage;
