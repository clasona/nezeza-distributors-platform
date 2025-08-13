import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import { OrderProps } from '../../../type';
import FormattedStatus from '../Table/FormattedStatus';
import formatDate from '@/utils/formatDate';
import OrderTotals from './OrderTotals';

interface OrderDetailsWithImagesProps {
  order: OrderProps;
}
const OrderDetailsWithImages = ({ order }: OrderDetailsWithImagesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Get unique images from order items (filter out undefined)
  const uniqueImages = Array.from(
    new Set(order.orderItems.map((item) => item.product.image).filter(Boolean))
  );

  // Handle navigation
  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev < uniqueImages.length - 3 ? prev + 1 : prev
    );
  };

  return (
    <div className='space-y-4'>
      {/* Order Title */}
      <div className='flex justify-between mb-4'>
        <p className='text-l font-semibold'>
          Order #{' '}
          <span className='font-bold text-vesoko_dark_blue'>{order._id}</span>
        </p>
        <p className='text-l font-semibold'>
          Status: <FormattedStatus status={order.fulfillmentStatus} />
        </p>
        <p className='text-l font-semibold'>
          Date:{' '}
          <span className='font-semibold text-vesoko_dark_blue'>
            {formatDate(order.createdAt)}
          </span>
        </p>
      </div>

      {/* Total Order Summary */}
      <div className='flex justify-between items-start'>
        <OrderTotals order={order} />

        {/* Image Collage */}
        {uniqueImages.length > 0 && (
          <div className='relative flex items-center ml-4'>
            {uniqueImages.length > 3 && (
              <button
                onClick={prevImage}
                className='absolute left-0 bg-white p-1 rounded-full shadow-md'
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className='flex gap-2 overflow-hidden'>
              {uniqueImages
                .slice(currentIndex, currentIndex + 3)
                .map((img, index) => (
                  <Image
                    key={index}
                    src={img || '/placeholder-image.png'}
                    alt={`Product ${index}`}
                    width={96}
                    height={96}
                    className='w-24 h-24 object-cover rounded-md'
                  />
                ))}
            </div>

            {uniqueImages.length > 3 && (
              <button
                onClick={nextImage}
                className='absolute right-0 bg-white p-1 rounded-full shadow-md'
                disabled={currentIndex >= uniqueImages.length - 3}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shipping Details */}
      <div className='mt-2'>
        <h4 className='text-sm font-semibold '>Shipping Address</h4>
        <p className='text-sm'>
          {order.shippingAddress ? (
            [
              order.shippingAddress.street1,
              order.shippingAddress.city,
              [order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(' '),
              order.shippingAddress.country
            ].filter(Boolean).join(', ')
          ) : (
            'No shipping address provided'
          )}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailsWithImages;
