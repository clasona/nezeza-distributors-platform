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


  useEffect(() => {
    if (id) {
      getSingleProduct(id).then(setProduct).catch(console.error);
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
  const handleBuyNow = () => {
    // handleAddToCart();
    router.push('/checkout');
  };

   const handleOpenReviewModal = () => {
     setIsReviewsModalOpen(true);
   };

   const handleCloseReviewModal = () => {
     setIsReviewsModalOpen(false);
   };

  if (!product) return <p className='text-center text-lg'>Loading...</p>;

  return (
    <div>
      <button
        className='px-4 py-1 bg-gray-300 text-nezeza_gray_600 rounded-md hover:bg-gray-400'
        onClick={() => router.back()}
      >
        Back
      </button>
      <div className='w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Product Images */}
        <div className='flex flex-col items-center'>
          <img
            src={product.image}
            alt={product.title}
            className='w-96 h-96 object-cover rounded-lg shadow-lg'
          />
          {/* Category Tag */}
          <p className='mt-2 text-sm text-gray-500 capitalize'>
            Category: {product.category}
          </p>
        </div>

        {/* Product Info */}
        <div>
          <h1 className='text-3xl font-bold'>{product.title}</h1>
          <p className='text-gray-600 mt-2'>{product.description}</p>

          {/* Price */}
          <p className='text-2xl font-semibold mt-4'>
            $ {product.price.toFixed(2)}
          </p>

          {/* Free Shipping & Availability */}
          <div className='mt-2 flex items-center gap-4'>
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
          <div className='mt-2'>
            <p className='text-gray-700'>Weight: {product.weight}kg</p>
            <p className='text-gray-700'>Height: {product.height}cm</p>
          </div>

          {/* Color Selection */}
          {product.colors?.length > 0 && (
            <div className='mt-4'>
              <p className='font-medium text-gray-700'>Available Colors:</p>
              <div className='flex gap-3 mt-2'>
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
          <div className='mt-6 flex flex-wrap gap-4 w-full justify-center sm:justify-start'>
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
                onClick={handleBuyNow}
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

          {/* Additional Info */}
          {/* <div className='mt-6 text-gray-500 text-sm'>
            <p>Added on: {new Date(product.createdAt).toLocaleDateString()}</p>
          </div> */}
          {/* Ratings */}
          <div className='mt-4 p-3 bg-gray-50 rounded-lg shadow-sm flex items-center text-center justify-center flex-wrap gap-4'>
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
                {product.rating.toFixed(1)}
              </span>
            </div>
            {/* See Reviews Link */}
            <button
              onClick={handleOpenReviewModal}
              className='bg-transparent text-nezeza_dark_blue hover:underline p-0 h-auto text-base' // Make it look like a link
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
              // neighborhoods={products}
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
