import { addToCart, addToFavorites, setBuyNowProduct, setShippingAddress, increaseQuantity, decreaseQuantity, deleteFavoritesProduct, deleteCartProduct } from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import { createPaymentIntent } from '@/utils/payment/createPaymentIntent';
import {
  getManufacturersProducts,
  getRetailersProducts,
  getWholesalersProducts,
} from '@/utils/product/getProductsBySeller';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AddressProps,
  OrderItemsProps,
  ProductProps,
  stateProps,
} from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import FormattedPrice from './FormattedPrice';
import Button from './FormInputs/Button';
import BuyQuantityModal from './Product/BuyQuantityModal';
import ReviewsModal from './Reviews/ReviewsModal';
import SuccessMessageModal from './SuccessMessageModal';

interface ProductsProps {
  products: ProductProps[];
  isLoading?: boolean;
}

const Products = ({ products, isLoading: propIsLoading }: ProductsProps) => {
  // const [products, setProducts] = useState<ProductProps[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use prop isLoading if provided, otherwise use internal state
  const effectiveIsLoading = propIsLoading !== undefined ? propIsLoading : isLoading;
  const { userInfo, cartItemsData, favoritesItemsData } = useSelector((state: stateProps) => state.next);
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
  const [addingToCartProductId, setAddingToCartProductId] = useState<
    string | null
  >(null);
  const [addingToFavoritesProductId, setAddingToFavoritesProductId] = useState<
    string | null
  >(null);
  const [buyingNowProductId, setBuyingNowProductId] = useState<string | null>(
    null
  );

  // Carousel state: map of productId -> current image index
  const [carouselIndexes, setCarouselIndexes] = useState<{
    [id: string]: number;
  }>({});

  const toggleProductDescription = (productId: string) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  // const fetchData = async () => {
  //   setIsLoading(true);
  //   let productsData;
  //   try {
  //     if (storeInfo) {
  //       if (storeInfo.storeType == 'wholesale') {
  //         productsData = await getManufacturersProducts();
  //       } else if (storeInfo.storeType == 'retail') {
  //         productsData = await getWholesalersProducts();
  //       }
  //     } else {
  //       productsData = await getRetailersProducts();
  //     }
  //     setProducts(productsData);
  //   } catch (error) {
  //     handleError(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

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
      setSuccessMessage('Added to cart!');
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    } finally {
      setAddingToCartProductId(null);
    }
  };

  // Modified Add to Favorites handler - toggle add/remove
  const handleAddToFavorite = async (product: ProductProps) => {
    const isCurrentlyInFavorites = Array.isArray(favoritesItemsData)
      ? favoritesItemsData.some(item => item.product._id === product._id)
      : false;
    
    setAddingToFavoritesProductId(product._id);
    try {
      if (isCurrentlyInFavorites) {
        // Remove from favorites
        dispatch(deleteFavoritesProduct(product._id));
        setSuccessMessage('Removed from favorites!');
      } else {
        // Add to favorites
        await dispatch(
          addToFavorites({
            product,
            quantity: 1,
          })
        );
        setSuccessMessage('Added to favorites!');
      }
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

  // Buy Now (Redirect to Checkout Review)
  const handleConfirmBuyNow = async (quantity: number) => {
    if (!selectedProductForBuyNow) return; // Should not happen

    setBuyingNowProductId(selectedProductForBuyNow._id);

    try {
      // Check if user has a shipping address
      if (!userInfo.address || !userInfo.address.street1) {
        setErrorMessage('Please add a shipping address to your profile first.');
        setBuyingNowProductId(null);
        setSelectedProductForBuyNow(null);
        setIsQuantityModalOpen(false);
        return;
      }

      console.log('Setting buy now product:', {
        product: selectedProductForBuyNow,
        quantity,
        isBuyNow: true,
      });

      // Set the buy now product in Redux
      dispatch(
        setBuyNowProduct({
          product: selectedProductForBuyNow,
          quantity,
          isBuyNow: true,
        })
      );

      // Set shipping address from user info
      const shippingAddress: AddressProps = {
        fullName: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
        street1: userInfo.address.street1,
        street2: userInfo.address.street2 || '',
        city: userInfo.address.city,
        state: userInfo.address.state,
        zip: userInfo.address.zip,
        country: userInfo.address.country,
        phone: userInfo.address.phone || userInfo.phone || '',
        email: userInfo.email,
      };

      console.log('Setting shipping address:', shippingAddress);
      dispatch(setShippingAddress(shippingAddress));

      // Give Redux time to persist the state before navigation
      console.log('Waiting for Redux state to persist...');
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Navigating to /checkout/buy-now');
      // Redirect to buy now checkout page for proper address validation
      router.push('/checkout/buy-now');
    } catch (error: any) {
      console.error('Error in handleConfirmBuyNow:', error);
      handleError(error);
      setErrorMessage(
        error?.message || 'Error during Buy Now process. Please try again.'
      );
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setBuyingNowProductId(null); // Reset loading state
      setSelectedProductForBuyNow(null); // Clear selected product
      setIsQuantityModalOpen(false); // Close the modal
    }
  };

  const handleCloseQuantityModal = () => {
    setIsQuantityModalOpen(false);
    setSelectedProductForBuyNow(null); // Clear selected product on close
  };

  // Carousel controls
  const handlePrevImage = (productId: string, imagesCount: number) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [productId]: prev[productId] > 0 ? prev[productId] - 1 : imagesCount - 1,
    }));
  };
  const handleNextImage = (productId: string, imagesCount: number) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [productId]: prev[productId] < imagesCount - 1 ? prev[productId] + 1 : 0,
    }));
  };

  if (!products?.length && !effectiveIsLoading) {
    return (
      <div className='w-full px-4 py-16'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🔍</div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>
            No products found
          </h3>
          <p className='text-gray-500 max-w-md mx-auto'>
            Try adjusting your search or browse our categories to discover amazing products.
          </p>
        </div>
      </div>
    );
  }

  if (effectiveIsLoading) {
    return (
      <div className='w-full px-4 py-16 text-center'>
        <div className='inline-flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-vesoko_dark_blue mr-3'></div>
          <span className='text-lg font-medium text-gray-700'>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 products-top animate-fade-in'>
      {products.map((product: ProductProps) => {
        const imagesArr =
          Array.isArray(product.images) && product.images.length
            ? product.images
            : product.image
            ? [product.image]
            : [];
        const currIndex = carouselIndexes[product._id] || 0;
        
        // Check if product is in cart or favorites
        interface CartItem {
          product: ProductProps;
          quantity: number;
        }

        interface FavoritesItem {
          product: ProductProps;
          quantity: number;
        }

        const isInCart: boolean = Array.isArray(cartItemsData)
          ? (cartItemsData as CartItem[]).some((item: CartItem) => item.product._id === product._id)
          : false;
        interface FavoritesItem {
          product: ProductProps;
          quantity: number;
        }
        const isInFavorites: boolean = Array.isArray(favoritesItemsData)
          ? (favoritesItemsData as FavoritesItem[]).some((item: FavoritesItem) => item.product._id === product._id)
          : false;
        interface CartItem {
          product: ProductProps;
          quantity: number;
        }
        const cartItem: CartItem | undefined = (Array.isArray(cartItemsData)
          ? (cartItemsData as CartItem[])
          : []
        ).find((item: CartItem) => item.product._id === product._id);

        return (
          <div
            key={product._id}
            className={`w-full bg-white text-black p-2 sm:p-3 lg:p-4 border border-gray-200 rounded-xl sm:rounded-2xl group overflow-hidden hover:cursor-pointer flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-vesoko_green_600/20 hover:-translate-y-2 transform touch-manipulation`}
          >
            <div className='w-full aspect-square relative mb-4 overflow-hidden rounded-xl bg-gray-50'>
              <div
                onClick={() => {
                  router.push(`/product/${product._id}`);
                }}
                className='relative h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer'
              >
                {/* Carousel */}
                {imagesArr.length > 1 && (
                  <button
                    type='button'
                    className='absolute left-1 top-1/2 z-10 p-1 rounded-full bg-gray-50/80 hover:bg-white border border-gray-300'
                    style={{ transform: 'translateY(-50%)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage(product._id, imagesArr.length);
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <Image
                  className='w-full h-full object-cover rounded-xl transition-all duration-500'
                  src={imagesArr[currIndex]}
                  alt='productImg'
                  width={300}
                  height={300}
                  layout='responsive'
                />
                {imagesArr.length > 1 && (
                  <button
                    type='button'
                    className='absolute right-1 top-1/2 z-10 p-1 rounded-full bg-gray-50/80 hover:bg-white border border-gray-300'
                    style={{ transform: 'translateY(-50%)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage(product._id, imagesArr.length);
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                {/* Carousel indicators */}
                {imagesArr.length > 1 && (
                  <div className='absolute bottom-1 left-1/2 flex gap-1 -translate-x-1/2'>
                    {imagesArr.map((_, idx) => (
                      <span
                        key={idx}
                        className={`inline-block w-2 h-2 rounded-full ${
                          idx === currIndex
                            ? 'bg-vesoko_green_600'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {product.quantity < 1 && (
                  <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                    <p className='bg-white p-2 text-vesoko_red_600 text-lg font-semibold'>
                      Out of Stock
                    </p>
                  </div>
                )}
              </div>
              {/* Action Buttons: Modern floating style */}
              <div className='absolute right-3 top-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='flex flex-col gap-2 items-end'>
                  {/* Cart Button - show quantity controls if in cart, otherwise show add to cart */}
                  {!(product.quantity < 1) && (
                    <div className='flex items-center'>
                      {isInCart && cartItem ? (
                        // Quantity controls when product is in cart
                        <div className='flex items-center bg-vesoko_green_600 text-white rounded-md px-1.5 py-1 gap-1 shadow-md'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (cartItem.quantity === 1) {
                                // Remove item from cart when quantity reaches 0
                                dispatch(deleteCartProduct(product._id));
                                setSuccessMessage('Removed from cart!');
                              } else {
                                dispatch(decreaseQuantity({ id: product._id }));
                              }
                            }}
                            className='hover:bg-vesoko_green_800 rounded p-0.5 transition-colors'
                          >
                            <Minus size={10} />
                          </button>
                          <span className='text-xs font-semibold min-w-[16px] text-center'>
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(increaseQuantity({ id: product._id }));
                            }}
                            className='hover:bg-vesoko_green_800 rounded p-0.5 transition-colors'
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      ) : (
                        // Add to cart button when not in cart
                        <Button
                          onClick={() => {
                            handleAddToCart(product);
                          }}
                          isLoading={addingToCartProductId === product._id}
                          buttonTitle=''
                          loadingButtonTitle=''
                          icon={ShoppingCart}
                          className='w-10 h-10 rounded-full flex items-center justify-center
                            text-sm bg-white shadow-lg hover:bg-vesoko_green_600 hover:text-white cursor-pointer duration-300 transform hover:scale-110'
                          disabled={
                            addingToCartProductId === product._id ||
                            addingToFavoritesProductId === product._id ||
                            buyingNowProductId === product._id
                          }
                        />
                      )}
                    </div>
                  )}
                  {/* Favorites Button - always positioned on the right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorite(product);
                    }}
                    disabled={
                      addingToCartProductId === product._id ||
                      addingToFavoritesProductId === product._id ||
                      buyingNowProductId === product._id
                    }
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm
                      shadow-lg hover:scale-110 cursor-pointer duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                        isInFavorites 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white text-red-500 hover:bg-red-50'
                      }`}
                  >
                    {addingToFavoritesProductId === product._id ? (
                      <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                    ) : (
                      <Heart 
                        size={16} 
                        className={isInFavorites ? 'fill-red-500' : ''}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className='flex-1 flex flex-col gap-3'>
              <div>
                <div className='flex justify-between items-center w-full mb-2'>
                  <span className='text-xs text-vesoko_gray_600 tracking-wide uppercase font-medium bg-gray-100 px-2 py-1 rounded-full'>
                    {product.category}
                  </span>
                </div>
                <h3 className='text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 leading-tight hover:text-vesoko_dark_blue transition-colors cursor-pointer'
                    onClick={() => router.push(`/product/${product._id}`)}>
                  {product.title}
                </h3>
                <div className='flex items-center gap-1 mb-2 sm:mb-3'>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={`sm:w-5 sm:h-5 ${
                          index < Math.floor(product.rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : index < product.rating
                            ? 'text-yellow-500 fill-yellow-500 opacity-50'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  <button
                    onClick={() => handleOpenReviewModal(product._id)}
                    className='bg-transparent text-vesoko_gray_600 hover:text-vesoko_dark_blue p-0 h-auto text-xs sm:text-sm transition-colors'
                  >
                    ({product.numOfReviews || 0})
                  </button>
                </div>
                <div className='mb-3 sm:mb-4'>
                  <p className='flex items-center mb-2'
                     onClick={() => router.push(`/product/${product._id}`)}>
                    <span className='text-lg sm:text-xl lg:text-2xl font-bold text-vesoko_dark_blue'>
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
                  {expandedProductId === product._id
                    ? 'Show Less'
                    : 'Read More'}
                </button>
              )}
              <div className='flex flex-col gap-2 sm:gap-3 mt-auto'>
                <Button
                  onClick={() => {
                    product.quantity < 1
                      ? handleAddToFavorite(product)
                      : handleAddToCart(product);
                  }}
                  isLoading={
                    (product.quantity < 1 &&
                      addingToFavoritesProductId === product._id) ||
                    (product.quantity >= 1 &&
                      addingToCartProductId === product._id)
                  }
                  buttonTitle={
                    product.quantity < 1 ? 'Favorites' : 'Add to Cart'
                  }
                  loadingButtonTitle={
                    product.quantity < 1
                      ? 'Adding...'
                      : 'Adding...'
                  }
                  className='flex items-center justify-center h-10 sm:h-12 text-xs sm:text-sm lg:text-base font-semibold bg-vesoko_dark_blue text-white rounded-lg sm:rounded-xl hover:bg-vesoko_dark_blue_2 transform hover:scale-105
                             duration-300 w-full transition-all shadow-lg'
                  disabled={
                    addingToCartProductId === product._id ||
                    addingToFavoritesProductId === product._id ||
                    buyingNowProductId === product._id
                  }
                />
                {/* Show Buy Now only if in stock */}
                {product.quantity > 0 && (
                  <Button
                    onClick={() => handleOpenQuantityModal(product)}
                    isLoading={buyingNowProductId === product._id}
                    buttonTitle='Buy Now'
                    loadingButtonTitle='Processing...'
                    className='flex items-center justify-center h-10 sm:h-12 text-xs sm:text-sm lg:text-base font-semibold bg-vesoko_green_600 text-white rounded-lg sm:rounded-xl hover:bg-vesoko_green_800 transform hover:scale-105 duration-300 w-full transition-all shadow-lg'
                    disabled={
                      addingToCartProductId === product._id ||
                      addingToFavoritesProductId === product._id ||
                      buyingNowProductId === product._id
                    }
                  />
                )}
              </div>
              {product.quantity < 1 && (
                <div className='text-xs text-center'>
                  <span className='text-vesoko_red_600'>
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
        );
      })}
      {/* Quantity Modal */}
      {isQuantityModalOpen && selectedProductForBuyNow && (
        <BuyQuantityModal
          isOpen={isQuantityModalOpen}
          onClose={handleCloseQuantityModal}
          product={selectedProductForBuyNow}
          onConfirm={handleConfirmBuyNow}
          maxQuantity={selectedProductForBuyNow.quantity}
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
