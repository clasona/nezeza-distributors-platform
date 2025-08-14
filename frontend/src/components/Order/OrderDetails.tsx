import formatDate from '@/utils/formatDate';
import { OrderProps } from '../../../type';
import FormattedStatus from '../Table/FormattedStatus';
import OrderTotals from './OrderTotals';

interface OrderDetailsProps {
  order: OrderProps;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <div className='space-y-4'>
      {/* Order Header */}
      <div className='flex justify-between'>
        <p className='text-l font-semibold'>
          Order #{' '}
          <span className='font-bold text-vesoko_primary'>{order._id}</span>
        </p>
        <p className='text-l font-semibold'>
          Status: <FormattedStatus status={order.fulfillmentStatus} />
        </p>
        <p className='text-l font-semibold'>
          Date:{' '}
          <span className='font-bold text-vesoko_primary'>
            {formatDate(order.createdAt)}
          </span>
        </p>
      </div>

      <OrderTotals order={order} />

      {/* Shipping Address */}
      <div className='mt-4'>
        <h4 className='text-md font-semibold mb-2'>Shipping Address</h4>
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

export default OrderDetails;
