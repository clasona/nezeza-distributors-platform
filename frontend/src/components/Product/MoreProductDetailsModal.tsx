import { addToCart, addToFavorites } from '@/redux/nextSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { ProductProps } from '../../../type';

interface ProductMoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductProps;
  onAddToCart: (productId: number, quantity: number) => void;
  onAddToFavorites: (productId: number) => void;
  onBuyAgain: (productId: number) => void;
}

const MoreProductDetailsModal = ({
  isOpen,
  onClose,
  product,
}: //   onAddToCart,
//   onAddToFavorites,
//   onBuyAgain,
ProductMoreInfoModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1); // Quantity state
  const images = product.images ?? [];
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white p-6 rounded-lg w-full sm:w-2/3 lg:w-1/2'>
        <div className='flex justify-between items-center'>
          <h3 className='text-xl font-semibold'>{product.title}</h3>
          <button
            onClick={onClose}
            className='text-red-500 text-lg font-semibold hover:text-red-700'
          >
            Close
          </button>
        </div>
        <div className='mt-4 flex'>
          {/* Image Carousel */}
          <div className='relative w-48'>
            <button
              onClick={handlePrevImage}
              className='absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md'
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <Image
              src={images[currentImageIndex]}
              alt={product.title}
              width={192}
              height={256}
              className='w-full h-64 object-cover rounded-md'
            />
            <button
              onClick={handleNextImage}
              className='absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md'
              disabled={currentImageIndex === images.length - 1}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className='ml-6'>
            <p className='text-sm text-gray-600'>{product.category}</p>
            <h4 className='text-xl font-bold mt-2'>
              ${product.price.toFixed(2)}
            </h4>
            <p className='text-sm mt-2'>{product.description}</p>

            {/* Rating and Reviews */}
            <div className='flex items-center mt-2'>
              <span className='text-yellow-500'>⭐⭐⭐⭐⭐</span>
              <span className='ml-2 text-sm text-gray-600'>
                {/* ({product.reviewsCount} Reviews) */} {'nbr of'}
                Reviews
              </span>
            </div>

            {/* Quantity Selector */}
            <div className='mt-4 flex items-center'>
              <button
                onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                className='px-4 py-2 border border-gray-300 rounded-l-md'
              >
                -
              </button>
              <input
                type='number'
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(Number(e.target.value), 1))
                }
                className='w-16 text-center border-t border-b border-gray-300'
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className='px-4 py-2 border border-gray-300 rounded-r-md'
              >
                +
              </button>
            </div>

            {/* Action Buttons */}
            <div className='mt-4'>
              <button
                onClick={() => {
                  dispatch(
                    addToCart({
                      product,
                      quantity: 1,
                    })
                  );
                  // setSuccessMessage('Added successfully!');
                }}
                className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300'
              >
                Add to Cart
              </button>
              <button
                // onClick={() => onBuyAgain(product._id)}
                className='w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300'
              >
                Buy Again
              </button>
              <button
                onClick={() => {
                  dispatch(
                    addToFavorites({
                      product,
                      quantity: 1,
                    })
                  );
                  // setSuccessMessage('Added successfully!');
                }}
                className='w-full mt-2 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition duration-300'
              >
                Add to Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className='mt-4'>
          <h5 className='font-semibold'>Product Details</h5>
          <p className='text-sm mt-2'>
            <strong>Material:</strong>
            {/* {product.material} */} {'enter'}
          </p>
          <p className='text-sm'>
            <strong>Dimensions:</strong>
            {/* {product.dimensions} */}
            {'enter'}
          </p>
          <h5 className='font-semibold mt-4'>Features:</h5>
          <ul className='list-disc pl-5'>
            {/* {product.features.map((feature, index) => (
              <li key={index} className='text-sm'>
                {feature}
              </li>
            ))} */}{' '}
            {'enter'}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MoreProductDetailsModal;
