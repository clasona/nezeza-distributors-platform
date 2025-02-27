import React, { useState } from 'react';
import { ProductProps } from '../../type';
import Image from 'next/image';
import { HiShoppingCart } from 'react-icons/hi';
import FormattedPrice from './FormattedPrice';
import { useDispatch } from 'react-redux';
import { addToCart, addToFavorite } from '@/redux/nextSlice';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/router';

const Products = ({ productData }: any) => {
  console.log('productData received:', productData);
  if (!productData || !Array.isArray(productData)) {
    console.error('productData is missing or not an array!');
    return <div>No products available.</div>;
  }

  const dispatch = useDispatch();
  const router = useRouter();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );

  const toggleProductDescription = (productId: string) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  return (
    <div className='w-full px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
      {productData.map((product: ProductProps) => {
        const isOutOfStock = product.quantity < 1;

        return (
          <div
            key={product._id}
            className={`w-full bg-white text-black p-4 border border-gray-300 rounded-lg group overflow-hidden 
            hover:cursor-pointer relative ${isOutOfStock ? 'opacity-50' : ''}`}
            onClick={() => {
              if (!isOutOfStock) {
                router.push(`/product/${product._id}`);
              }
            }}
          >
            <div className='w-full h-[260px] relative'>
              <Image
                className='w-full h-full object-cover scale-90 hover:scale-100 transition-transform duration-300'
                width={300}
                height={300}
                src={product.image}
                alt='productImg'
              />
              {isOutOfStock && (
                <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                  <p className='text-white text-lg font-semibold'>
                    Out of Stock
                  </p>
                </div>
              )}

              <div
                className='w-12 h-12 absolute bottom-20 right-0 border-[1px] 
                          border-gray-400 bg-white rounded-md flex flex-col translate-x-20 group-hover:translate-x-0
                          transition-transform duration-300'
              >
                <span
                  onClick={() =>
                    !isOutOfStock &&
                    dispatch(
                      addToCart({
                        product,
                        quantity: 1,
                      })
                    )
                  }
                  className={`w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center 
                              text-xl bg-transparent hover:bg-nezeza_yellow cursor-pointer duration-300
                              ${
                                isOutOfStock
                                  ? 'cursor-not-allowed opacity-50'
                                  : ''
                              }`}
                >
                  <HiShoppingCart />
                </span>

                <span
                  onClick={() =>
                    dispatch(
                      addToFavorite({
                        product,
                        quantity: 1,
                      })
                    )
                  }
                  className='w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center 
                              text-xl bg-transparent hover:bg-nezeza_yellow cursor-pointer duration-300
                              '
                >
                  <Heart />
                </span>
              </div>
            </div>
            <hr />
            <div className='px-4 py-3 flex flex-col gap-1'>
              <p className='text-xs text-nezeza_gray_600 tracking-wide'>
                {product.category}
              </p>
              <p className='text-base font-medium'>{product.title}</p>
              <p className='flex items-center'>
                <span className='text-nezeza_dark_blue font-bold'>
                  <FormattedPrice amount={product.price} />
                </span>
              </p>

              <p className='text-xs text-gray-600 text-justify'>
                {product.description.length > 100
                  ? expandedProductId === product._id
                    ? product.description
                    : `${product.description.substring(0, 100)}...`
                  : product.description}
              </p>
              {product.description.length > 100 && (
                <button
                  onClick={() => toggleProductDescription(product._id)}
                  className='text-blue-500 text-xs font-medium focus:outline-none'
                >
                  {expandedProductId === product._id
                    ? 'Show Less'
                    : 'Read More'}
                </button>
              )}

              <button
                onClick={() =>
                  !isOutOfStock &&
                  dispatch(
                    addToCart({
                      product,
                      quantity: 1,
                    })
                  )
                }
                className={`h-10 font-medium text-white rounded-md duration-300 mt-2 ${
                  isOutOfStock
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-nezeza_dark_blue hover:bg-nezeza_yellow hover:text-black'
                }`}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Products;
