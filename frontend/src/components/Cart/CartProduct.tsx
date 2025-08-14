import React, { useState } from 'react';
import Image from 'next/image';
import FormattedPrice from '../FormattedPrice';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import {
  addToFavorites,
  decreaseQuantity,
  deleteCartProduct,
  increaseQuantity,
} from '@/redux/nextSlice';
import { OrderItemsProps } from '../../../type';
import { Heart } from 'lucide-react';
import SuccessMessageModal from '../SuccessMessageModal';
import ConfirmRemoveProductModal from './ConfirmRemoveProductModal';

interface CartProductProps {
  item: OrderItemsProps;
}

const CartProduct = ({ item }: CartProductProps) => {
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
          src={product.images[0]}
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
                  className='text-sm text-vesoko_primary hover:text-vesoko_primary font-medium transition-colors duration-200 mt-1'
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-500'>Unit Price</p>
              <p className='text-lg font-semibold text-gray-900'>
                <FormattedPrice amount={item.price} />
              </p>
            </div>
          </div>
          
          {!isOutOfStock && (
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-gray-100'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                  <button
                    onClick={() =>
                      dispatch(
                        decreaseQuantity({
                          id: product._id,
                          title: item.title,
                          price: item.price,
                          description: product.description,
                          category: product.category,
                          image: product.images[0],
                          quantity: 1,
                        })
                      )
                    }
                    className='w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200'
                  >
                    <LuMinus className='h-4 w-4' />
                  </button>
                  <span className='w-12 h-8 flex items-center justify-center bg-white text-sm font-medium'>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        increaseQuantity({
                          id: product._id,
                          title: item.title,
                          price: item.price,
                          description: product.description,
                          category: product.category,
                          image: product.images[0],
                          quantity: 1,
                        })
                      )
                    }
                    className='w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200'
                  >
                    <LuPlus className='h-4 w-4' />
                  </button>
                </div>
                
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => {
                      dispatch(
                        addToFavorites({
                          product,
                          quantity: 1,
                        })
                      );
                      setSuccessMessage('Moved to favorites successfully!');
                      dispatch(deleteCartProduct(product._id));
                    }}
                    className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-vesoko_primary border border-vesoko_primary rounded-lg hover:bg-vesoko_primary hover:text-white transition-all duration-200'
                    aria-label='Move to Favorites'
                  >
                    <Heart className='h-4 w-4' />
                    <span className='hidden sm:inline'>Save to Favorites</span>
                  </button>
                  
                  <button
                    onClick={() => setIsRemoveModalOpen(true)}
                    className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors duration-200'
                    aria-label='Remove item'
                  >
                    <IoMdClose className='h-4 w-4' />
                    <span className='hidden sm:inline'>Remove</span>
                  </button>
                </div>
              </div>
              
              <div className='text-right'>
                <p className='text-sm text-gray-500'>Total</p>
                <p className='text-xl font-bold text-vesoko_primary'>
                  <FormattedPrice amount={item.price * item.quantity} />
                </p>
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
        onConfirmRemove={() => dispatch(deleteCartProduct(product._id))}
        product={item}
      />
    </div>
  );
};

export default CartProduct;
