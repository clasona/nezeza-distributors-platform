import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { stateProps } from '../../../type';
import cartIcon from '@/images/cart.png';

interface CartProps {
  productData?: stateProps[];
}
const Cart = ({ productData }: CartProps) => {
  return (
    <div className='flex items-center justify-center rounded-lg bg-vesoko_primary text-white w-24'>
      <Link
        href={'/cart'}
        className='flex items-center px-2  border
            border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'
      >
        {/* <ShoppingCart className='w-auto object-cover h-8' /> */}
        <Image
          className='w-auto object-cover h-8'
          src={cartIcon}
          alt='cartImg'
        />
        <p className='text-xs font-semibold mt-3'>Cart</p>
        <span className='absolute text-vesoko_primary text-sm -top-0 left-[29px] font-bold'>
          {productData ? productData.length : 0}
        </span>
      </Link>
    </div>
  );
};

export default Cart;
