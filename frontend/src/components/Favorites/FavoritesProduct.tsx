import React, { useState } from 'react';
import Image from 'next/image';
import FormattedPrice from '../FormattedPrice';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import {
  addToCart,
  deleteFavoritesProduct,
} from '@/redux/nextSlice';
import { OrderItemsProps } from '../../../type';
import { ShoppingCart } from 'lucide-react';
import SuccessMessageModal from '../SuccessMessageModal';
import ConfirmRemoveProductModal from './ConfirmRemoveProductModal';

interface FavoritesProductProps {
  item: OrderItemsProps;
}

const FavoritesProduct = ({ item }: FavoritesProductProps) => {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState('');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const isOutOfStock = item.product.quantity < 1;
  const product = item.product;
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 p-4 ${isOutOfStock ? 'opacity-50' : ''}
      }`}
    >
      <div className='relative flex-shrink-0'>
        <Image
          className='object-cover w-24 h-24 sm:w-32 sm:h-32 rounded-lg'
          width={150}
          height={150}
          src={item.product.images[0]}
          alt='productImage'
        />
        {isOutOfStock && (
          <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
            <span className='text-white text-xs font-semibold'>Out of Stock</span>
          </div>
        )}
      </div>
      <div className='flex-1 flex flex-col justify-between'>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                {item.title}
              </h3>
              <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                {showFullDescription
                  ? product.description
                  : product.description.slice(0, 80) +
                    (product.description.length > 80 ? '...' : '')}
              </p>
              {product.description.length > 80 && (
                <button
                  onClick={toggleDescription}
                  className='text-sm text-vesoko_dark_blue hover:text-vesoko_green_600 font-medium transition-colors duration-200 mt-1'
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-500'>Price</p>
              <p className='text-lg font-semibold text-gray-900'>
                <FormattedPrice amount={item.price} />
              </p>
            </div>
          </div>
          
          {!isOutOfStock && (
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-gray-100'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => {
                    dispatch(
                      addToCart({
                        product,
                        quantity: 1,
                      })
                    );
                    setSuccessMessage('Moved to cart successfully!');
                    dispatch(deleteFavoritesProduct(product._id));
                  }}
                  className='flex items-center gap-2 px-4 py-2 bg-vesoko_green_600 text-white text-sm font-medium rounded-lg hover:bg-vesoko_green_700 transition-colors duration-200'
                  aria-label='Move to Cart'
                >
                  <ShoppingCart className='h-4 w-4' />
                  Add to Cart
                </button>
                
                <button
                  onClick={() => setIsRemoveModalOpen(true)}
                  className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-200'
                  aria-label='Remove from favorites'
                >
                  <IoMdClose className='h-4 w-4' />
                  <span className='hidden sm:inline'>Remove</span>
                </button>
              </div>
              
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <span>♥</span>
                <span>Saved to favorites</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      
      <ConfirmRemoveProductModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirmRemove={() => dispatch(deleteFavoritesProduct(product._id))}
        product={item}
      />
    </div>
  );
};

export default FavoritesProduct;
