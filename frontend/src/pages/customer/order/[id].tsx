import OrderDetails from '@/components/Order/OrderDetails';
import { OrderItemDetails } from '@/components/Order/OrderItemDetails';
import RootLayout from '@/components/RootLayout';
import { getSingleOrder } from '@/utils/order/getSingleOrder';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { OrderProps } from '../../../../type';

const SingleOrderDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get order ID from URL

  const [order, setOrder] = useState<OrderProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await getSingleOrder(id as string);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  const isOrderProps = (data: any): data is OrderProps =>
    'fulfillmentStatus' in data;

  return (
    <RootLayout>
      <div className='pt-8 px-4'>
        {isOrderProps(order) && (
          <>
            <div className='flex justify-between mb-4'>
              <h3 id='modal-title' className='text-lg font-semibold'>
                Order Details
              </h3>
              {/* Action Buttons */}
              <div className='space-x-3'>
                <button
                  //   onClick={() => onCancelOrder?.(order._id)}
                  className='px-4 py-1 text-white bg-red-500 rounded-md hover:bg-red-600'
                >
                  Cancel Order
                </button>

                <button
                  //   onClick={() => onViewInvoice?.(order._id)}
                  className='px-4 py-1 text-white bg-nezeza_dark_blue rounded-md hover:bg-blue-600'
                >
                  View Invoice
                </button>
                <button
                  //   onClick={() => onArchiveOrder?.(order._id)}
                  className='px-4 py-1 text-white bg-gray-500 rounded-md hover:bg-gray-600'
                >
                  Archive
                </button>
                <button
                  className='px-4 py-1 bg-gray-300 text-nezeza_gray_600 rounded-md hover:bg-gray-400'
                  onClick={() => router.back()}
                >
                  Back
                </button>
                {/* <button
                  onClick={onClose}
                  className='px-4 py-1 bg-gray-300 text-nezeza_gray_600 rounded-md hover:bg-gray-400'
                >
                  Close
                </button> */}
              </div>
            </div>

            <div className='space-y-2'>
              <OrderDetails order={order} />

              {/* Payment Method */}
              <div>
                <h4 className='text-md font-semibold mb-2'>Payment Method</h4>
                <p>{order.paymentMethod}</p>
              </div>

              {/* Order Items */}
              <h4 className='text-md font-semibold mb-2'>Item(s)</h4>
              <div className='w-full grid grid-cols-1 xl:grid-cols-2 gap-6'>
                {order.orderItems.map((item) => (
                  <OrderItemDetails key={item._id} item={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </RootLayout>
  );
};

SingleOrderDetails.noLayout = true;
export default SingleOrderDetails;
