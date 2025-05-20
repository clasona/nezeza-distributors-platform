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

const ProductDetails = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useDispatch();

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
              className='bg-nezeza_dark_blue text-white flex items-center justify-center px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-blue-800 transition w-full sm:w-auto'
            >
              <ShoppingCart className='mr-2' /> Add to Cart
            </Button>
            <Button
              onClick={handleAddToFavorite}
              className='border border-gray-300 flex items-center justify-center px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-gray-100 hover:text-nezeza_green_800 transition w-full sm:w-auto'
            >
              <Heart className='mr-2 text-red-500' /> Add to Favorites
            </Button>
            {/* <Button
              onClick={handleBuyNow}
              className='bg-nezeza_green_600 text-white flex items-center justify-center px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-nezeza_green_800 transition w-full sm:w-auto'
            >
              Buy Now
            </Button> */}

            <div className='flex flex-col items-center text-center justify-center'>
              <button
                onClick={handleBuyNow}
                className={`w-full p-2 text-sm font-semibold bg-nezeza_green_600 text-white rounded-lg hover:bg-nezeza_green_800 hover:text-white duration-300 ${
                  !userInfo ? 'pointer-events-none bg-nezeza_gray_600' : ''
                }`}
              >
                Buy Now
              </button>

              {!userInfo && (
                <p className='text-xs mt-1 text-nezeza_red_600 font-semibold animate-bounce'>
                  Please Login to buy now!
                </p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className='mt-6 text-gray-500 text-sm'>
            <p>Added on: {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
          {/* Ratings */}
          <div className='flex items-center mt-4'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < product.rating
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className='ml-2 text-gray-600'>
              ({product.numOfReviews} reviews)
            </span>
          </div>
        </div>
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
