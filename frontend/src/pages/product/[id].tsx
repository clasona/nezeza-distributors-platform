import ErrorMessageModal from '@/components/ErrorMessageModal';
import ReviewsModal from '@/components/Reviews/ReviewsModal';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { Button } from '@/components/ui/button';
import { addToCart, addToFavorites, decreaseQuantity, deleteCartProduct, deleteFavoritesProduct, increaseQuantity, setBuyNowProduct, setShippingAddress } from '@/redux/nextSlice';
import { handleError } from '@/utils/errorUtils';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddressProps, ProductProps, stateProps } from '../../../type';
import { getSingleProduct } from '../../utils/product/getSingleProduct';

const ProductDetails = () => {
  const { userInfo, cartItemsData, favoritesItemsData } = useSelector((state: stateProps) => state.next);
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCartProductId, setAddingToCartProductId] = useState<string | null>(null);
  const [addingToFavoritesProductId, setAddingToFavoritesProductId] = useState<string | null>(null);
  const [buyingNowProductId, setBuyingNowProductId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // Carousel state
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      getSingleProduct(id)
        .then((prod) => {
          setProduct(prod);
          setActiveImage(0);
        })
        .catch(console.error);
    }
  }, [id]);

  // Check if product is in cart or favorites
  const isInCart = Array.isArray(cartItemsData)
    ? cartItemsData.some(item => item.product._id === product?._id)
    : false;
  const isInFavorites = Array.isArray(favoritesItemsData)
    ? favoritesItemsData.some(item => item.product._id === product?._id)
    : false;
  const cartItem = Array.isArray(cartItemsData)
    ? cartItemsData.find(item => item.product._id === product?._id)
    : undefined;

  // Add to Cart with enhanced functionality
  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCartProductId(product._id);
    try {
      await dispatch(
        addToCart({
          product,
          quantity,
        })
      );
      setSuccessMessage('Added to cart!');
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error?.message || 'Error adding to cart');
    } finally {
      setAddingToCartProductId(null);
    }
  };

  // Add to Favorites with toggle functionality
  const handleAddToFavorite = async () => {
    if (!product) return;
    setAddingToFavoritesProductId(product._id);
    try {
      if (isInFavorites) {
        dispatch(deleteFavoritesProduct(product._id));
        setSuccessMessage('Removed from favorites!');
      } else {
        await dispatch(
          addToFavorites({
            product,
            quantity: 1,
          })
        );
        setSuccessMessage('Added to favorites!');
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error?.message || 'Error updating favorites');
    } finally {
      setAddingToFavoritesProductId(null);
    }
  };

  // Buy Now (Redirect to Checkout Review) - uses quantity from page selector
  const handleBuyNow = async () => {
    if (!product || !userInfo) {
      setErrorMessage('Please login to buy now!');
      return;
    }
    
    setBuyingNowProductId(product._id);
    try {
      // Check if user has a shipping address
      if (!userInfo.address || !userInfo.address.street1) {
        setErrorMessage('Please add a shipping address to your profile first.');
        setBuyingNowProductId(null);
        return;
      }

      // Set the buy now product in Redux using the selected quantity from the page
      dispatch(
        setBuyNowProduct({
          product,
          quantity, // Use the quantity from the page selector
          isBuyNow: true,
        })
      );

      // Set shipping address from user info
      const shippingAddress: AddressProps = {
        name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
        street1: userInfo.address.street1,
        street2: userInfo.address.street2 || '',
        city: userInfo.address.city,
        state: userInfo.address.state,
        zip: userInfo.address.zip,
        country: userInfo.address.country,
        phone: userInfo.address.phone || userInfo.phone || '',
        email: userInfo.email,
      };

      dispatch(setShippingAddress(shippingAddress));

      // Redirect to buy now checkout page for proper address validation
      router.push('/checkout/buy-now');
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error?.message || 'Error during Buy Now process.');
    } finally {
      setBuyingNowProductId(null);
    }
  };

  // Quantity handlers
  const handleIncreaseQuantity = () => {
    if (quantity < product!.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Cart quantity handlers
  const handleCartIncrease = () => {
    if (product) {
      dispatch(increaseQuantity({ id: product._id }));
    }
  };

  const handleCartDecrease = () => {
    if (product && cartItem) {
      if (cartItem.quantity === 1) {
        dispatch(deleteCartProduct(product._id));
        setSuccessMessage('Removed from cart!');
      } else {
        dispatch(decreaseQuantity({ id: product._id }));
      }
    }
  };

  const handleOpenReviewModal = () => {
    setIsReviewsModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewsModalOpen(false);
  };

  // Carousel navigation handlers
  const getImagesArr = () => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0)
      return product.images;
    if (product.image) return [product.image];
    return [];
  };
  const imagesArr = getImagesArr();

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev > 0 ? prev - 1 : imagesArr.length - 1));
  };
  const handleNextImage = () => {
    setActiveImage((prev) => (prev < imagesArr.length - 1 ? prev + 1 : 0));
  };

  if (!product) return <p className='text-center text-lg'>Loading...</p>;

  return (
    <div className='max-w-6xl mx-auto px-2 md:px-6 py-6'>
      <button
        className='px-4 py-1 bg-gray-300 text-vesoko_gray_600 rounded-md hover:bg-gray-400 mb-3'
        onClick={() => router.back()}
      >
        Back
      </button>
      <div className='w-full flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow p-4 md:p-8'>
        {/* Product Images + Carousel */}
        <div className='flex-1 flex flex-col items-center md:items-start relative w-full'>
          <div className='w-full max-w-sm relative'>
            <div className='aspect-w-1 aspect-h-1 relative flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden'>
              {imagesArr.length > 1 && (
                <button
                  type='button'
                  className='absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-50/80 hover:bg-white border border-gray-300'
                  onClick={handlePrevImage}
                  aria-label='Previous Image'
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {imagesArr.length > 0 ? (
                <Image
                  src={imagesArr[activeImage]}
                  alt={product.title}
                  width={350}
                  height={350}
                  className='w-full h-full object-contain rounded-lg max-h-[350px]'
                />
              ) : (
                <div className='w-full h-[350px] flex items-center justify-center text-gray-400'>
                  No image
                </div>
              )}
              {imagesArr.length > 1 && (
                <button
                  type='button'
                  className='absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-50/80 hover:bg-white border border-gray-300'
                  onClick={handleNextImage}
                  aria-label='Next Image'
                >
                  <ChevronRight size={24} />
                </button>
              )}
              {imagesArr.length > 1 && (
                <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1'>
                  {imagesArr.map((_, idx) => (
                    <span
                      key={idx}
                      className={`inline-block w-2 h-2 rounded-full ${
                        idx === activeImage
                          ? 'bg-vesoko_primary'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Out of stock badge */}
              {!product.availability && (
                <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                  <p className='bg-white p-2 text-vesoko_red_600 text-lg font-semibold rounded'>
                    Out of Stock
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Category Tag */}
          <p className='mt-3 text-sm text-gray-500 capitalize text-center md:text-left'>
            Category: {product.category}
          </p>
        </div>

        {/* Product Info */}
        <div className='flex-1 flex flex-col justify-between w-full'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>{product.title}</h1>
            <p className='text-gray-600 mt-2'>{product.description}</p>

            {/* Price */}
            <p className='text-xl md:text-2xl font-semibold mt-4'>
              $ {product.price.toFixed(2)}
            </p>

            {/* Free Shipping & Availability */}
            <div className='mt-2 flex flex-wrap items-center gap-2 md:gap-4'>
              {product.freeShipping && (
                <span className='flex items-center text-green-600 font-medium'>
                  <Truck className='h-5 w-5 mr-1' /> Free Shipping
                </span>
              )}
              {product.availability ? (
                <span className='flex items-center text-green-600 font-medium'>
                  <CheckCircle className='h-5 w-5 mr-1' /> 
                  {product.quantity <= 20 ? `In Stock (${product.quantity} left)` : 'In Stock'}
                </span>
              ) : (
                <span className='flex items-center text-red-500 font-medium'>
                  <AlertTriangle className='h-5 w-5 mr-1' /> Out of Stock
                </span>
              )}
            </div>

            {/* Product Dimensions */}
            <div className='mt-2 flex flex-wrap gap-4 text-gray-700 text-sm md:text-base'>
              <p>Weight: {product.weight}lbs</p>
              <p>Height: {product.height}in</p>
              <p>Width: {product.width}in</p>
              <p>Length: {product.length}in</p>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className='mt-4'>
                <p className='font-medium text-gray-700'>Available Colors:</p>
                <div className='flex gap-3 mt-2 flex-wrap'>
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className='w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-vesoko_primary transition-colors'
                      style={{ backgroundColor: color }}
                      title={color}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.availability && (
              <div className='mt-6'>
                <p className='font-medium text-gray-700 mb-2'>Quantity:</p>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className='w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-vesoko_primary hover:bg-vesoko_background transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <Minus size={16} />
                  </button>
                  <span className='mx-4 text-lg font-semibold min-w-[2rem] text-center'>
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= product.quantity}
                    className='w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-vesoko_primary hover:bg-vesoko_background transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <Plus size={16} />
                  </button>
                  {product.quantity <= 20 && (
                    <span className='text-sm text-gray-500 ml-2'>
                      ({product.quantity} available)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='mt-8 space-y-4'>
              {/* Cart Actions */}
              {isInCart && cartItem ? (
                <div className='flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <CheckCircle className='text-green-600' size={20} />
                  <span className='text-green-700 font-medium'>In Cart ({cartItem.quantity})</span>
                  <div className='flex items-center gap-2 ml-auto'>
                    <button
                      onClick={handleCartDecrease}
                      className='w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-vesoko_primary transition-colors'
                    >
                      <Minus size={14} />
                    </button>
                    <span className='mx-2 font-semibold'>{cartItem.quantity}</span>
                    <button
                      onClick={handleCartIncrease}
                      disabled={cartItem.quantity >= product.quantity}
                      className='w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-vesoko_primary transition-colors disabled:opacity-50'
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCartProductId === product._id || !product.availability}
                  className='w-full bg-vesoko_primary text-white flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg hover:bg-vesoko_primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {addingToCartProductId === product._id ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className='mr-2' size={20} />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}

              {/* Favorites and Buy Now Row */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button
                  onClick={handleAddToFavorite}
                  disabled={addingToFavoritesProductId === product._id}
                  className={`flex-1 border-2 flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-colors ${
                    isInFavorites
                      ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-vesoko_primary hover:bg-vesoko_background hover:text-vesoko_green_800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addingToFavoritesProductId === product._id ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2'></div>
                      {isInFavorites ? 'Removing...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Heart
                        className={`mr-2 ${isInFavorites ? 'fill-red-500 text-red-500' : 'text-red-500'}`}
                        size={20}
                      />
                      {isInFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={buyingNowProductId === product._id || !product.availability || !userInfo}
                  className={`flex-1 flex items-center justify-center px-6 py-3 text-base font-semibold bg-vesoko_primary text-white rounded-lg hover:bg-vesoko_secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    !userInfo ? 'bg-gray-400' : ''
                  }`}
                >
                  {buyingNowProductId === product._id ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>

              {!userInfo && (
                <p className='text-sm text-center text-vesoko_red_600 font-medium bg-red-50 p-2 rounded-lg border border-red-200'>
                  Please login to make purchases
                </p>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className='mt-6 p-3 bg-gray-50 rounded-lg shadow-sm flex flex-col sm:flex-row items-center text-center justify-center flex-wrap gap-4'>
            <div className='flex items-center gap-1'>
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
              <span className='text-base font-semibold ml-1 text-gray-800'>
                {product.rating?.toFixed(1)}
              </span>
            </div>
            {/* See Reviews Link */}
            <button
              onClick={handleOpenReviewModal}
              className='bg-transparent text-vesoko_primary hover:underline p-0 h-auto text-base'
            >
              Reviews ({product.numOfReviews || 0})
            </button>
          </div>

          {/* Review Modal */}
          {isReviewsModalOpen && (
            <ReviewsModal
              isOpen={isReviewsModalOpen}
              onClose={handleCloseReviewModal}
              product={product}
            />
          )}
        </div>
      </div>
      
      {/* Success and Error Modals */}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {errorMessage && (
        <ErrorMessageModal errorMessage={errorMessage} />
      )}
    </div>
  );
};

export default ProductDetails;
