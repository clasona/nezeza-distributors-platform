import SuccessMessageModal from '@/components/SuccessMessageModal';
import { Button } from '@/components/ui/button';
import { addToCart, addToFavorites } from '@/redux/nextSlice';
import {
  AlertTriangle,
  CheckCircle,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProductProps, stateProps } from '../../../type';
import { getSingleProduct } from '../../utils/product/getSingleProduct';
import ReviewsModal from '@/components/Reviews/ReviewsModal';

const ProductDetails = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
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

  // Add to Cart
  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    setSuccessMessage('Added to Cart!');
  };

  // Add to Favorites
  const handleAddToFavorite = () => {
    dispatch(addToFavorites({ product, quantity: 1 }));
    setSuccessMessage('Added to Favorites!');
  };

  // Buy Now (Redirect to Checkout)
  const handleBuyNow = async (product: ProductProps) => {
    await dispatch(
      addToCart({
        product,
        quantity: 1,
      })
    );
    router.push('/checkout');
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
        className='px-4 py-1 bg-gray-300 text-nezeza_gray_600 rounded-md hover:bg-gray-400 mb-3'
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
                <img
                  src={imagesArr[activeImage]}
                  alt={product.title}
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
                          ? 'bg-nezeza_green_600'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Out of stock badge */}
              {!product.availability && (
                <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
                  <p className='bg-white p-2 text-nezeza_red_600 text-lg font-semibold rounded'>
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
                  <CheckCircle className='h-5 w-5 mr-1' /> In Stock (
                  {product.quantity} left)
                </span>
              ) : (
                <span className='flex items-center text-red-500 font-medium'>
                  <AlertTriangle className='h-5 w-5 mr-1' /> Out of Stock
                </span>
              )}
            </div>

            {/* Product Dimensions */}
            <div className='mt-2 flex flex-wrap gap-4 text-gray-700 text-sm md:text-base'>
              <p>Weight: {product.weight}kg</p>
              <p>Height: {product.height}cm</p>
              <p>Width: {product.width}cm</p>
              <p>Length: {product.length}cm</p>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className='mt-4'>
                <p className='font-medium text-gray-700'>Available Colors:</p>
                <div className='flex gap-3 mt-2 flex-wrap'>
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className='w-8 h-8 rounded-full border'
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='mt-6 flex flex-col sm:flex-row flex-wrap gap-4 w-full'>
              <Button
                onClick={handleAddToCart}
                className='bg-nezeza_dark_blue text-white flex items-center justify-center px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-nezeza_green_600 transition w-full sm:w-auto'
              >
                <ShoppingCart className='mr-2' /> Add to Cart
              </Button>
              <Button
                onClick={handleAddToFavorite}
                className='border border-gray-300 flex items-center justify-center px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-gray-100 hover:text-nezeza_green_800 transition w-full sm:w-auto'
              >
                <Heart className='mr-2 text-red-500' /> Add to Favorites
              </Button>

              <div className='w-full sm:w-auto'>
                <Button
                  onClick={() => handleBuyNow(product)}
                  className={`flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-nezeza_green_600 text-white rounded-lg hover:bg-nezeza_green_800 hover:text-white duration-300 ${
                    !userInfo ? 'pointer-events-none bg-nezeza_gray_600' : ''
                  }`}
                >
                  Buy Now
                </Button>

                {!userInfo && (
                  <p className='text-xs mt-1 text-nezeza_red_600 font-semibold animate-bounce'>
                    Please Login to buy now!
                  </p>
                )}
              </div>
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
              className='bg-transparent text-nezeza_dark_blue hover:underline p-0 h-auto text-base'
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
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
