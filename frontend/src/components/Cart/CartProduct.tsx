import React, { useState } from 'react';
import Image from 'next/image';
import FormattedPrice from '../FormattedPrice';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import {
  decreaseQuantity,
  deleteProduct,
  increaseQuantity,
} from '@/redux/nextSlice';
import { OrderItemsProps } from '../../../type';

interface CartProductProps {
  item: OrderItemsProps;
}

const CartProduct = ({ item }: CartProductProps) => {
  const dispatch = useDispatch();

  const isOutOfStock = item.product.quantity < 1;
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  return (
    <div
      className={`bg-gray-100 rounded-lg flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-2 sm:p-4 ${
        isOutOfStock ? 'opacity-50' : ''
      }`}
    >
      {' '}
      <Image
        className='object-cover w-32 h-32 sm:w-40 sm:h-40'
        width={150}
        height={150}
        src={item.image}
        alt='productImage'
      />
      <div className='flex flex-col sm:flex-row items-start sm:items-center px-2 gap-2 sm:gap-4 w-full'>
        <div className='flex flex-col gap-1 w-full'>
          <p className='text-lg font-semibold text-nezeza_dark_blue'>
            {item.title}
          </p>
          <p className='text-sm text-gray-600'>
            {showFullDescription
              ? item.description
              : item.description.slice(0, 100) +
                (item.description.length > 100 ? '...' : '')}
          </p>
          {item.description.length > 100 && (
            <button
              onClick={toggleDescription}
              className='text-sm text-nezeza_dark_blue hover:underline'
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          )}{' '}
          <p className='text-sm text-gray-600'>
            Unit Price{' '}
            <span className='font-semibold text-nezeza_dark_blue'>
              <FormattedPrice amount={item.price} />
            </span>
          </p>
          {isOutOfStock ? (
            <p className='text-nezeza_red_600 font-bold'>Out of Stock</p>
          ) : (
            <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-6 mt-2'>
              <div className='flex items-center justify-between border border-gray-300 px-3 py-1 rounded-full sm:w-28 w-full shadow-md shadow-gray-300'>
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
