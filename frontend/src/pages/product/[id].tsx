import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSingleProduct } from '../../utils/product/getSingleProduct';
import { ProductProps } from '../../../type';

const ProductDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductProps | null>(null);

  useEffect(() => {
    if (id) {
      getSingleProduct(id).then(setProduct).catch(console.error);
    }
  }, [id]);

  if (!product) return <p className='text-center text-lg'>Loading...</p>;

  return (
    <div>
      <button
        className='px-4 py-1 bg-gray-300 text-nezeza_gray_600 rounded-md hover:bg-gray-400'
        onClick={() => router.back()}
      >
        Back
      </button>
      <div className='container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
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
          <div className='mt-6 flex gap-4'>
            <Button className='bg-nezeza_dark_blue text-white flex items-center px-6 py-2 rounded-lg hover:bg-blue-700 transition'>
              <ShoppingCart className='mr-2' /> Add to Cart
            </Button>
            <Button className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition'>
              Buy Now
            </Button>
            <Button className='border border-gray-300 flex items-center px-6 py-2 rounded-lg hover:bg-gray-100 transition'>
              <Heart className='mr-2 text-red-500' /> Add to Favorites
            </Button>
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
                  i < product.averageRating
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
      </div>
    </div>
  );
};

export default ProductDetails;
