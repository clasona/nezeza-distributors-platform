import {
  addToCart,
  addToFavorites,
  setBuyNowProduct
} from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import { createPaymentIntent } from '@/utils/payment/createPaymentIntent';
import {
  getManufacturersProducts,
  getRetailersProducts,
  getWholesalersProducts,
} from '@/utils/product/getProductsBySeller';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddressProps, OrderItemsProps, ProductProps, stateProps } from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import FormattedPrice from './FormattedPrice';
import Button from './FormInputs/Button';
import BuyQuantityModal from './Product/BuyQuantityModal';
import ReviewsModal from './Reviews/ReviewsModal';
import SuccessMessageModal from './SuccessMessageModal';

const Products = () => {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const [isLoading, setIsLoading] = useState(false);
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );
  const [openReviewProductId, setOpenReviewProductId] = useState<string | null>(
    null
  );
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedProductForBuyNow, setSelectedProductForBuyNow] =
    useState<ProductProps | null>(null);
  // New loading states for individual actions
  const [addingToCartProductId, setAddingToCartProductId] = useState<
    string | null
  >(null);
  const [addingToFavoritesProductId, setAddingToFavoritesProductId] = useState<
    string | null
  >(null);
  const [buyingNowProductId, setBuyingNowProductId] = useState<string | null>(
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

  const handleOpenReviewModal = (productId: string) => {
    setOpenReviewProductId(productId);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewProductId(null);
  };

  const handleAddToCart = async (product: ProductProps) => {
    setAddingToCartProductId(product._id);
    try {
      await dispatch(
        addToCart({
          product,
          quantity: 1,
        })
      );
      setSuccessMessage('Added successfully!');
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    } finally {
      setAddingToCartProductId(null);
    }
  };

  // Modified Add to Favorites handler
  const handleAddToFavorite = async (product: ProductProps) => {
    setAddingToFavoritesProductId(product._id);
    try {
      await dispatch(
        addToFavorites({
          product,
          quantity: 1,
        })
      );
      setSuccessMessage('Added successfully!');
    } catch (error) {
      handleError(error);
    } finally {
      setAddingToFavoritesProductId(null);
    }
  };

  const handleOpenQuantityModal = (product: ProductProps) => {
    if (!userInfo) {
      setErrorMessage('Please login to buy now!');
      return;
    }
    setSelectedProductForBuyNow(product);
    setIsQuantityModalOpen(true);
  };

  // Buy Now (Redirect to Checkout)
  const handleConfirmBuyNow = async (quantity: number) => {
    if (!selectedProductForBuyNow) return; // Should not happen

    setBuyingNowProductId(selectedProductForBuyNow._id);

    try {
      const singleOrderItem: OrderItemsProps = {
        title: selectedProductForBuyNow.title,
        price: selectedProductForBuyNow.price,
        quantity: quantity,
        description: selectedProductForBuyNow.description,
        category: selectedProductForBuyNow.category,
        image: selectedProductForBuyNow.image,
        product: selectedProductForBuyNow,
        sellerStoreId: selectedProductForBuyNow.storeId,
        sellerStoreAddress: selectedProductForBuyNow.storeId.address as AddressProps,
        addedToInventory: false, 
        status: 'Active', 
        cancelledQuantity: 0,
        // Add any other properties that OrderItemsProps expects if missing
      };

      const itemsForPaymentIntent: any = [singleOrderItem];

      //TODO: Use actual shipping address from redux or userInfo.address, and redirect to address page if not present
      const testShippingAddress: AddressProps = {
        fullName: userInfo.firstName || '',
        street1: userInfo.address?.street1 || '',
        city: userInfo.address?.city || '',
        state: userInfo.address?.state || '',
        zip: userInfo.address?.zip || '',
        country: userInfo.address?.country || '',
        phone: userInfo.address?.phone || '',
        email: userInfo.email || '',
      };
      const response = await createPaymentIntent(
        itemsForPaymentIntent,
        testShippingAddress
      );
      const clientSecret = response?.data?.clientSecret;

      dispatch(
        setBuyNowProduct({
          product: selectedProductForBuyNow,
          quantity,
          isBuyNow: true,
        })
      );

      // Proceed to checkout if clientSecret is available
      if (clientSecret) {
        router.push(
          {
            pathname: '/checkout/buy-now',
            query: { clientSecret },
          },
          '/checkout/buy-now'
        );
      } else {
        setErrorMessage('No client secret found.');
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(
        error?.message || 'Error during Buy Now process. Please try again.'
      );
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setBuyingNowProductId(null); // Reset loading state
      setSelectedProductForBuyNow(null); // Clear selected product
      setIsQuantityModalOpen(false); // Close the modal    }
    }
  };

  const handleCloseQuantityModal = () => {
    setIsQuantityModalOpen(false);
    setSelectedProductForBuyNow(null); // Clear selected product on close
  };

  if (!products.length && !isLoading) {
    return (
      <div className='w-full text-center text-bold'>
        No products available at the moment.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='w-full text-center text-bold'>Loading products...</div>
    );
  }

  return (
    <div className='w-full px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 products-top'>
      {products.map((product: ProductProps) => (
        <div
          key={product._id}
          className={`w-full bg-white text-black p-3 sm:p-3 border border-gray-300 rounded-lg group overflow-hidden hover:cursor-pointer `}
        >
          <div
            className='w-full aspect-w-1 aspect-h-1 relative'
            // onClick={() => {
            //   router.push(`/product/${product._id}`);
            // }}
          >
            <div
              onClick={() => {
                router.push(`/product/${product._id}`);
              }}
            >
              <Image
                className='w-full h-full object-cover scale-90 hover:scale-100
                        transition-transform duration-300'
                src={product.image}
                alt='productImg'
                width={300}
                height={300}
                layout='responsive'
              />
              {product.quantity < 1 && (
                <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                  <p className='bg-white p-2 text-nezeza_red_600 text-lg font-semibold'>
                    Out of Stock
                  </p>
                </div>
              )}
            </div>
            <div
              className='w-10 sm:w-12 h-10 sm:h-12 absolute bottom-16 sm:bottom-20 right-0 border-[1px] 
                        border-gray-400 bg-white rounded-md flex flex-col translate-x-16 sm:translate-x-20 group-hover:translate-x-0
                        transition-transform duration-300'
            >
              {!(product.quantity < 1) && (
                <Button
                  onClick={() => handleAddToCart(product)} // Use modified handler
                  isLoading={addingToCartProductId === product._id} // Pass isLoading state
                  buttonTitle=''
                  loadingButtonTitle='' // Use default spinner if not specified
                  icon={ShoppingCart}
                  className={`w-full h-full border-b-[1px] border-b-gray-400 flex items-center justify-center
                            text-lg sm:text-xl bg-transparent hover:bg-nezeza_green_600 hover:text-white cursor-pointer duration-300
                            ${
                              product.quantity < 1
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                  disabled={
                    product.quantity < 1 ||
                    addingToCartProductId === product._id ||
                    addingToFavoritesProductId === product._id ||
                    buyingNowProductId === product._id
                  }
                />
              )}

              <Button
                onClick={() => handleAddToFavorite(product)} // Use modified handler
                isLoading={addingToFavoritesProductId === product._id} // Pass isLoading state
                buttonTitle=''
                loadingButtonTitle=''
                icon={Heart} // Pass icon as prop
                className='w-full h-full flex items-center justify-center text-lg sm:text-xl
                           bg-transparent hover:bg-nezeza_green_600 hover:text-white cursor-pointer duration-300'
                disabled={
                  addingToCartProductId === product._id ||
                  addingToFavoritesProductId === product._id ||
                  buyingNowProductId === product._id
                }
              />
            </div>
          </div>
          <hr />
          <div className='px-2 py-1 flex flex-col gap-1'>
            <div>
              <div className='flex justify-between w-full'>
                <p className='text-xs text-nezeza_gray_600 tracking-wide'>
                  {product.category}
                </p>
                {/* <p className='text-xs text-nezeza_gray_600 tracking-wide'>
                {getStoreName(product.storeId._id)}
              </p> */}
              </div>
              <div className='flex flex-col sm:flex-row flex-wrap sm:justify-between'>
                <p className='text-sm sm:text-base font-medium'>
                  {product.title}
                </p>
                <div className='flex items-center gap-1 text-right w-full sm:w-auto'>
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={20}
                      className={`${
                        index < Math.floor(product.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : index < product.rating
                          ? 'text-yellow-500 fill-yellow-500 opacity-50'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  {/* <span className='text-sm sm:text-base ml-1 text-gray-800'>
                    {product.rating.toFixed(1)}
                  </span> */}
                  <button
                    onClick={() => handleOpenReviewModal(product._id)}
                    className='bg-transparent text-nezeza_dark_blue hover:underline p-0 h-auto text-base'
                  >
                    ({product.numOfReviews || 0})
                  </button>
                </div>
              </div>
              <div
                onClick={() => {
                  router.push(`/product/${product._id}`);
                }}
              >
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
                  <span className='block sm:hidden'>
                    {product.description.length > 100
                      ? expandedProductId === product._id
                        ? product.description
                        : `${product.description.substring(0, 20)}...`
                      : product.description}
                  </span>
                  <span className='hidden sm:block'>
                    {product.description.length > 100
                      ? expandedProductId === product._id
                        ? product.description
                        : `${product.description.substring(0, 50)}...`
                      : product.description}
                  </span>
                </p>
              </div>
            </div>
            {product.description.length > 100 && (
              <button
                onClick={() => toggleProductDescription(product._id)}
                className='text-blue-500 text-xs font-medium focus:outline-none'
              >
                {expandedProductId === product._id ? 'Show Less' : 'Read More'}
              </button>
            )}
            <Button
              onClick={() => {
                product.quantity < 1
                  ? handleAddToFavorite(product) // Use handleAddToFavorite
                  : handleAddToCart(product); // Use handleAddToCart
              }}
              isLoading={
                (product.quantity < 1 &&
                  addingToFavoritesProductId === product._id) || // Favorites loading
                (product.quantity >= 1 && addingToCartProductId === product._id) // Cart loading
              }
              buttonTitle={
                product.quantity < 1 ? 'Add to Favorites' : 'Add to Cart'
              }
              loadingButtonTitle={
                product.quantity < 1
                  ? 'Adding to Favorites...'
                  : 'Adding to Cart...'
              }
              className='flex items-center justify-center h-8 sm:h-10 text-sm sm:text-base font-medium bg-nezeza_dark_blue text-white rounded-md hover:bg-nezeza_dark_blue_2
                         duration-300 mt-2 w-full'
              disabled={
                addingToCartProductId === product._id ||
                addingToFavoritesProductId === product._id ||
                buyingNowProductId === product._id
              }
            />
            {/* Show Buy Now only if in stock */}
            {product.quantity > 0 && (
              <Button
                onClick={() => handleOpenQuantityModal(product)} // Open the quantity modal
                isLoading={buyingNowProductId === product._id} // Pass isLoading state
                buttonTitle='Buy Now'
                loadingButtonTitle='Processing...'
                className='flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-nezeza_green_600 text-white rounded-lg hover:bg-nezeza_green_800 hover:text-white duration-300 mt-2 w-full'
                disabled={
                  // !userInfo ||
                  addingToCartProductId === product._id ||
                  addingToFavoritesProductId === product._id ||
                  buyingNowProductId === product._id
                }
              />
            )}
            {product.quantity < 1 && (
              <div className='text-xs text-center'>
                <span className='text-nezeza_red_600'>
                  (notified when available)
                </span>
              </div>
            )}
          </div>
          {/* Review Modal */}
          {openReviewProductId === product._id && (
            <ReviewsModal
              isOpen={true}
              onClose={handleCloseReviewModal}
              product={product}
            />
          )}
        </div>
      ))}
      {/* Quantity Modal */}
      {isQuantityModalOpen && selectedProductForBuyNow && (
        <BuyQuantityModal
          isOpen={isQuantityModalOpen}
          onClose={handleCloseQuantityModal}
          product={selectedProductForBuyNow}
          onConfirm={handleConfirmBuyNow}
          maxQuantity={selectedProductForBuyNow.quantity} // Pass available stock
        />
      )}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default Products;
