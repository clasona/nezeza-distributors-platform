import React, { useState } from 'react';
import Image from 'next/image';
import FormattedPrice from '../FormattedPrice';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import {
  addToCart,
  decreaseQuantity,
  deleteFavoritesProduct,
  increaseQuantity,
} from '@/redux/nextSlice';
import { OrderItemsProps } from '../../../type';
import { ShoppingCart } from 'lucide-react';
import SuccessMessageModal from '../SuccessMessageModal';

interface FavoritesProductProps {
  item: OrderItemsProps;
}

const FavoritesProduct = ({ item }: FavoritesProductProps) => {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState('');

  const isOutOfStock = item.product.quantity < 1;
  const product = item.product;
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
              ? product.description
              : product.description.slice(0, 100) +
                (product.description.length > 100 ? '...' : '')}
          </p>
          {product.description.length > 100 && (
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
              <button
                onClick={() => {
                  dispatch(
                    addToCart({
                      product,
                      quantity: 1,
                    })
                  );
                    setSuccessMessage('Moved to cart successfully!');
                    dispatch(deleteFavoritesProduct(product._id))
                }}
                className='flex items-center gap-2 h-6 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm font-medium bg-nezeza_dark_blue text-white rounded-md 
               hover:bg-nezeza_green_600 transition duration-300'
                aria-label='Move to Cart'
              >
                <ShoppingCart className='h-4 w-4' />
                Move to Cart
              </button>
              <div
                onClick={() => dispatch(deleteFavoritesProduct(product._id))}
                className='flex items-center gap-1 text-sm font-medium text-gray-400 
               hover:text-red-600 cursor-pointer transition duration-300'
                aria-label='Remove from favorites'
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
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
    </div>
  );
};

export default FavoritesProduct;
