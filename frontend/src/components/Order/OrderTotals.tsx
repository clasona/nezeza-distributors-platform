import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import { OrderItemsProps, OrderProps } from '../../../type';

interface OrderTotalsProps {
  order: OrderProps;
}

const OrderTotals = ({ order }: OrderTotalsProps) => {
  return (
    <div>
      {/* Listing the order items */}
      {/* <div className='mb-2'>
        <p className='text-sm font-semibold mb-1 text-vesoko_gray_700'>
          Order Items
        </p>
        <ul>
          {order.orderItems.map((item: OrderItemsProps) => (
            <li
              key={item.product._id || item.product.id}
              className='flex justify-between text-sm text-vesoko_gray_600 mb-1'
            >
              <span>
                {item.product.title}
                <span className='ml-2 text-xs text-vesoko_dark_blue'>
                  x{item.quantity}
                </span>
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div> */}
      <p className='text-sm text-vesoko_gray_600'>
        {order.orderItems.length} Item(s) Subtotal:{' '}
        <span className='font-medium text-vesoko_dark_blue'>
          ${calculateOrderItemsSubtotal(order) || 0}
        </span>
      </p>
      <p className='text-sm text-vesoko_gray_600'>
        Shipping: ${order.totalShipping.toFixed(2)}
      </p>
      <p className='text-sm text-vesoko_gray_600'>
        Tax: ${order.totalTax.toFixed(2)}
      </p>
      <p className='text-sm font-semibold mt-2'>
        Grand Total:{' '}
        <span className='text-vesoko_dark_blue'>
          ${order.totalAmount.toFixed(2)}
        </span>
      </p>
    </div>
  );
};

export default OrderTotals;
