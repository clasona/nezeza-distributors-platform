import React, { useEffect, useState } from 'react';
import { OrderItemsProps, ProductProps } from '../../../type';
import { useRouter } from 'next/router';
import { getSingleProduct } from '@/utils/product/getSingleProduct';

export const OrderItemDetails = ({ item }: { item: OrderItemsProps }) => {
  const router = useRouter();

  const [product, setProduct] = useState<ProductProps | null>(null);

  useEffect(() => {
    if (item.product) {
      getSingleProduct(item.product._id).then(setProduct).catch(console.error);
    }
  }, [item.product]);

  if (!product) return <p className='text-center text-lg'>Loading item...</p>;

  return (
    <div className='bg-white text-black p-2 border border-gray-300 rounded-lg shadow group overflow-hidden'>
      <div className='flex items-center gap-4'>
        <div>
          <img
            src={product.image}
            alt={product.title}
            className='w-24 h-24 object-cover rounded-md'
          />
        </div>
        <div>
          <div className='flex-1'>
            <h5 className='text-lg font-semibold'>{product.title}</h5>
            <p className='text-sm text-nezeza_gray_600'>
              {item.quantity} x ${item.price.toFixed(2)}
            </p>
          </div>
          {/* Action Buttons */}
          <div className='flex mt-4 gap-4'>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-red-600 hover:text-white transition duration-300'
              // onClick={() => handleRemove(item._id)} // Replace with your "remove" logic
            >
              Remove
            </button>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-yellow-500 hover:text-white transition duration-300'
              // onClick={() => handleReturn(item._id)} // Replace with your "return" logic
            >
              Return
            </button>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-nezeza_dark_blue hover:text-white transition duration-300'
              onClick={() => {
                router.push(`/product/${item.product._id}`);
              }}
            >
              More Info
            </button>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-nezeza_dark_blue hover:text-white transition duration-300'
              // onClick={() => router.push(`/product/${item._id}`)}
            >
              Buy Again
            </button>
          </div>
        </div>
        {/* <div className='flex flex-col items-end gap-2'>
                        <p className='text-sm text-gray-500'>
                          Item status: (here)
                        </p>
                      </div> */}
      </div>
    </div>
  );
};
