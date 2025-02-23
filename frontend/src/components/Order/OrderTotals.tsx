import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import { OrderProps } from '../../../type';

interface OrderTotalsProps {
  order: OrderProps;
}

const OrderTotals = ({ order }: OrderTotalsProps) => {
  return (
    <div>
      <p className='text-sm text-nezeza_gray_600'>
        {order.orderItems.length} Item(s) Subtotal:{' '}
        {calculateOrderItemsSubtotal(order) || 0}
      </p>
      <p className='text-sm text-nezeza_gray_600'>
        Shipping: ${order.totalShipping.toFixed(2)}
      </p>
      <p className='text-sm text-nezeza_gray_600'>
        Tax: ${order.totalTax.toFixed(2)}
      </p>
      <p className='text-sm font-semibold'>
        Grand Total:{' '}
        <span className='text-nezeza_dark_blue'>
          ${order.totalAmount.toFixed(2)}
        </span>
      </p>
    </div>
  );
};

export default OrderTotals;
