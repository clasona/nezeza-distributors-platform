import React from 'react';
import Image from 'next/image';
import FormattedPrice from '../FormattedPrice';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import {
  decreaseQuantity,
  deleteProduct,
  increaseQuantity,
} from '@/store/nextSlice';
import { OrderItemsProps } from '../../../type';
interface Item {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
}

interface CartProductProps {
  item: OrderItemsProps;
}

const CartProduct = ({ item }: CartProductProps) => {
  const dispatch = useDispatch();
  
  const isOutOfStock = item.product.quantity < 1;

  return (
    <div
      className={`bg-gray-100 rounded-lg flex items-center gap-4 p-4 ${
        isOutOfStock ? 'opacity-50' : ''
      }`}
    >
      {' '}
      <Image
        className='object-cover'
        width={150}
        height={150}
        src={item.image}
        alt='productImage'
      />
      <div className='flex items-center px-2 gap-4'>
        <div className='flex flex-col gap-1'>
          <p className='text-lg font-semibold text-nezeza_dark_blue'>
            {item.title}
          </p>
          <p className='text-sm text-gray-600'>{item.description}</p>
          <p className='text-sm text-gray-600'>
            Unit Price{' '}
            <span className='font-semibold text-nezeza_dark_blue'>
              <FormattedPrice amount={item.price} />
            </span>
          </p>
          {isOutOfStock ? (
            <p className='text-nezeza_red_600 font-bold'>Out of Stock</p>
          ) : (
            <div className='flex items-center gap-6'>
              <div className='flex items-center mt-1 mb-1 justify-between border border-gray-300 px-4 py-1 rounded-full w-28 shadow-md shadow-gray-300'>
                <span
                  onClick={() =>
                    dispatch(
                      increaseQuantity({
                        id: item.product._id,
                        title: item.title,
                        price: item.price,
                        description: item.description,
                        category: item.category,
                        image: item.image,
                        quantity: 1,
                      })
                    )
                  }
                  className='w-6 h-6 flex items-center justify-center rounded-full text-base bg-transparent hover:bg-gray-300 cursor-pointer decoration-purple-300'
                >
                  <LuPlus />
                </span>
                <span>{item.quantity}</span>
                <span
                  onClick={() =>
                    dispatch(
                      decreaseQuantity({
                        id: item.product._id,
                        title: item.title,
                        price: item.price,
                        description: item.description,
                        category: item.category,
                        image: item.image,
                        quantity: 1,
                      })
                    )
                  }
                  className='w-6 h-6 flex items-center justify-center rounded-full text-base bg-transparent hover:bg-gray-300 cursor-pointer decoration-purple-300'
                >
                  <LuMinus />
                </span>
              </div>
              <div
                onClick={() => dispatch(deleteProduct(item.product._id))}
                className='flex items-center text-sm font-medium text-gray-400 hover:text-red-600 cursor-pointer duration-300'
              >
                <IoMdClose className='mt-[2px]' /> <p>remove</p>
              </div>
            </div>
          )}
        </div>
        <div className='text-lg font-semibold text-nezeza_dark_blue'>
          <FormattedPrice amount={item.price * item.quantity} />
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
