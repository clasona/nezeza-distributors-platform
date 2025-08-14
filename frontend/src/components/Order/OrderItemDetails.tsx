import { cancelSingleOrderProduct } from '@/utils/order/cancelSingleOrderProduct';
import { getSingleProduct } from '@/utils/product/getSingleProduct';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { OrderItemsProps, ProductProps } from '../../../type';
import CancelItemModal from './CancelItemModal';

interface OrderItemDetailsProps {
  item: OrderItemsProps;
  orderId: string;
}
export const OrderItemDetails = ({ item, orderId }: OrderItemDetailsProps) => {
  const router = useRouter();

  const [product, setProduct] = useState<ProductProps | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (item.product) {
      getSingleProduct(item.product._id).then(setProduct).catch(console.error);
    }
  }, [item.product]);

  // Util function handler
  const handleCancelItem = async (quantity: number, reason: string) => {
    setLoadingCancel(true);
    setCancelError(null);
    setCancelSuccess(null);
    console.log('Cancelling item:', {
      orderId,
      productId: item.product._id,
      quantity,
      reason,
    });
    try {
      const response = await cancelSingleOrderProduct(
        orderId,
        item.product._id,
        quantity,
        reason
      );
      setCancelSuccess(response.msg);
      // Optionally refetch order data or update UI here
    } catch (err: any) {
      setCancelError(err || 'Failed to cancel item. Please try again.');
    } finally {
      setLoadingCancel(false);
    }
  };

  if (!product) return <p className='text-center text-lg'>Loading item...</p>;

  return (
    <div className='bg-white text-black p-2 border border-gray-300 rounded-lg shadow group overflow-hidden'>
      <div className='flex items-center gap-4'>
        <div>
          <Image
            src={product.image || '/placeholder-image.png'}
            alt={product.title}
            width={96}
            height={96}
            className='w-24 h-24 object-cover rounded-md'
          />
        </div>
        <div>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1'>
              <h5 className='text-lg font-semibold'>{product.title}</h5>
              <p className='text-sm text-vesoko_gray_600'>
                {item.quantity} x ${item.price.toFixed(2)}
              </p>
            </div>
            {item.status && item.status !== 'Active' && (
              <span className='text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800'>
                {item.status}
              </span>
            )}
          </div>
          {/* Action Buttons */}
          <div className='flex mt-4 gap-4'>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-red-400 hover:text-white transition duration-300'
              onClick={() => setShowCancelModal(true)}
              disabled={loadingCancel}
            >
              {loadingCancel ? 'Cancelling...' : 'Cancel'}
            </button>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-yellow-400 hover:text-white transition duration-300'
              onClick={() => {
                router.push(`/product/${item.product._id}`);
              }}
            >
              More Info
            </button>
            <button
              className='px-4 py-1 border border-gray rounded-lg text-sm hover:bg-vesoko_primary hover:text-white transition duration-300'
              // onClick={() => handleOpenQuantityModal(product)}
            >
              Buy Again
            </button>
          </div>
          {cancelError && (
            <p className='text-xs text-red-600 mt-2'>{cancelError}</p>
          )}
          {cancelSuccess && (
            <p className='text-xs text-green-700 mt-2'>{cancelSuccess}</p>
          )}
        </div>
        {/* <div className='flex flex-col items-end gap-2'>
                        <p className='text-sm text-gray-500'>
                          Item status: (here)
                        </p>
                      </div> */}
      </div>
      <CancelItemModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={async (quantity, reason) => {
          setShowCancelModal(false);
          await handleCancelItem(quantity, reason);
        }}
        defaultQuantity={1}
        maxQuantity={item.quantity - item.cancelledQuantity}
        cancelledQuantity={item.cancelledQuantity || 0}
      />
    </div>
  );
};
