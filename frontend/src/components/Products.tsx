import { addToCart, addToFavorite } from '@/redux/nextSlice';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { HiShoppingCart } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { ProductProps, stateProps } from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import FormattedPrice from './FormattedPrice';
import SuccessMessageModal from './SuccessMessageModal';
import { handleError } from '@/utils/errorUtils';
import {
  getManufacturersProducts,
  getRetailersProducts,
  getWholesalersProducts,
} from '@/utils/product/getProductsBySeller';

const Products = () => {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );

  const toggleProductDescription = (productId: string) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  const fetchData = async () => {
    setIsLoading(true);
    let productsData;
    try {
      if (storeInfo) {
        if (storeInfo.storeType == 'wholesale') {
          productsData = await getManufacturersProducts();
        } else if (storeInfo.storeType == 'retail') {
          productsData = await getWholesalersProducts();
        }
      } else {
        productsData = await getRetailersProducts();
      }
      setProducts(productsData);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (!products) {
    return (
      <div className='w-full text-center text-bold'>
        No products available at the moment.
      </div>
    );
  }

  return (
    <div className='w-full px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
      {products.map((product: ProductProps) => (
        <div
          key={product._id}
          className={`w-full bg-white text-black p-4 border border-gray-300 rounded-lg group overflow-hidden hover:cursor-pointer `}
        >
          <div
            className='w-full h-[260px] relative'
            onClick={() => {
              router.push(`/product/${product._id}`);
            }}
          >
            <Image
              className='w-full h-full object-cover scale-90 hover:scale-100
                        transition-transform duration-300'
              width={300}
              height={300}
              src={product.image}
              alt='productImg'
            />
            {product.quantity < 1 && (
              <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                <p className='bg-white p-2 text-nezeza_red_600 text-lg font-semibold'>
                  Out of Stock
                </p>
              </div>
            )}
            <div
              className='w-12 h-12 absolute bottom-20 right-0 border-[1px] 
                        border-gray-400 bg-white rounded-md flex flex-col translate-x-20 group-hover:translate-x-0
                        transition-transform duration-300'
            >
              {!(product.quantity < 1) && (
                <span
                  onClick={() => {
                    dispatch(
                      addToCart({
                        product,
                        quantity: 1,
                      })
                    );
                    setSuccessMessage('Added successfully!');
                  }}
                  className={`w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center 
                            text-xl bg-transparent hover:bg-nezeza_green_600 cursor-pointer duration-300
                            ${
                              product.quantity < 1
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                >
                  <HiShoppingCart />
                </span>
              )}

              <span
                onClick={() => {
                  dispatch(
                    addToFavorite({
                      product,
                      quantity: 1,
                    })
                  );
                  setSuccessMessage('Added successfully!');
                }}
                className='w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center 
                            text-xl bg-transparent hover:bg-nezeza_green_600 cursor-pointer duration-300
                            '
              >
                <Heart />
              </span>
            </div>
          </div>
          <hr />
          <div className='px-4 py-3 flex flex-col gap-1'>
            <div className='flex justify-between w-full'>
              <p className='text-xs text-nezeza_gray_600 tracking-wide'>
                {product.category}
              </p>
              {/* <p className='text-xs text-nezeza_gray_600 tracking-wide'>
                {getStoreName(product.storeId._id)}
              </p> */}
            </div>
            <p className='text-base font-medium'>{product.title}</p>
            <p className='flex items-center'>
              <span className='text-nezeza_dark_blue font-bold'>
                <FormattedPrice amount={product.price} />
              </span>
            </p>
            <p
              className='text-xs text-gray-600 text-justify'
              onClick={() => {
                router.push(`/product/${product._id}`);
              }}
            >
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
                {expandedProductId === product._id ? 'Show Less' : 'Read More'}
              </button>
            )}
            <button
              onClick={() => {
                product.quantity < 1
                  ? dispatch(
                      addToFavorite({
                        product,
                        quantity: 1,
                      })
                    )
                  : dispatch(
                      addToCart({
                        product,
                        quantity: 1,
                      })
                    );
                setSuccessMessage('Added successfully!');
              }}
              className='h-10 font-medium bg-nezeza_dark_blue text-white round-md hover:bg-nezeza_green_600 
                             duration-300 mt-2'
            >
              {product.quantity < 1 ? 'Add to Favorites' : 'Add to Cart'}
            </button>
            {product.quantity < 1 && (
              <div className='text-xs text-center'>
                <span className='text-nezeza_red_600'>
                  We'll notify you when it's available.
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default Products;
