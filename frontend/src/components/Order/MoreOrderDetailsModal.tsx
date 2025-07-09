//Used by sellers when buying

import React, { useEffect, useState } from 'react';
import { OrderProps } from '../../../type';
import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import FormattedStatus from '../Table/FormattedStatus';
import { OrderItemDetails } from './OrderItemDetails';

interface MoreOrderDetailsModalProps<T> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onCancelOrder?: (orderId: number | string) => void;
  onArchiveOrder?: (orderId: number | string) => void;
  onViewInvoice?: (orderId: number | string) => void;
}

const MoreOrderDetailsModal = <T,>({
  isOpen,
  rowData,
  onClose,
  onCancelOrder,
  onArchiveOrder,
  onViewInvoice,
}: MoreOrderDetailsModalProps<T>) => {
  if (!isOpen) return null;

  const [orderData, setOrderData] = useState<T>(rowData);
  console.log('MoreOrderDetailsModal orderData', orderData);

  useEffect(() => {
    if (isOpen) {
      setOrderData(rowData);
    }
  }, [isOpen, rowData]); // This effect runs whenever `isOpen` or `rowData` changes

  const isOrderProps = (data: any): data is OrderProps =>
    'fulfillmentStatus' in data;

  if (isOrderProps(orderData)) {
    console.log('order items', orderData.orderItems);
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'
    >
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-full max-w-7xl'>
        {isOrderProps(orderData) && (
          <>
            <div className='flex justify-between mb-4'>
              <h3 id='modal-title' className='text-lg font-semibold'>
                Order Details
              </h3>
              {/* Action Buttons */}
              <div className='space-x-3'>
                {orderData.fulfillmentStatus !== 'Archived' && (
                  <button
                    onClick={() => onCancelOrder?.(orderData._id)}
                    className='px-4 py-1 text-white bg-red-500 rounded-md hover:bg-red-600'
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  onClick={() => onViewInvoice?.(orderData._id)}
                  className='px-4 py-1 text-white bg-vesoko_dark_blue rounded-md hover:bg-blue-600'
                >
                  View Invoice
                </button>
                {orderData.fulfillmentStatus !== 'Archived' && (
                  <button
                    onClick={() => onArchiveOrder?.(orderData._id)}
                    className='px-4 py-1 text-white bg-gray-500 rounded-md hover:bg-gray-600'
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={onClose}
                  className='px-4 py-1 bg-gray-300 text-vesoko_gray_600 rounded-md hover:bg-gray-400'
                >
                  Close
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <p>
                  <strong>Order #: </strong>
                  <span className='font-bold text-vesoko_dark_blue'>
                    {orderData._id}
                  </span>
                </p>
                <p>
                  <strong>Order Status:</strong>{' '}
                  <FormattedStatus status={orderData.fulfillmentStatus} />
                </p>
                <p>
                  <strong>Order Date: </strong>
                  <span className='font-bold text-vesoko_dark_blue'>
                    {orderData.createdAt}
                  </span>
                </p>
              </div>

              {/* Order Summary */}
              <div className='flex justify-between'>
                <div>
                  <h4 className='text-md font-semibold mb-2'>Order Summary</h4>
                  <ul className='space-y-1 px-3'>
                    <li>
                      <strong>Item(s) Subtotal:</strong>{' '}
                      {calculateOrderItemsSubtotal(orderData) || 0}
                    </li>
                    <li>
                      <strong>Shipping:</strong> $
                      {orderData.totalShipping.toFixed(2)}
                    </li>
                    <li>
                      <strong>Tax:</strong> ${orderData.totalTax.toFixed(2)}
                    </li>
                    <li>
                      <strong>Grand Total:</strong>{' '}
                      <span className='font-bold text-vesoko_dark_blue'>
                        ${orderData.totalAmount.toFixed(2)}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className='text-md font-semibold mb-2'>Payment Method</h4>
                  <p>{orderData.paymentMethod}</p>
                </div>
                {/* Shipping Address */}
                <div>
                  <h4 className='text-md font-semibold mb-2'>
                    Shipping Address
                  </h4>
                  <p>
                    {/* {orderData.shippingAddress},<br /> */}
                    {orderData.shippingAddress?.street1},<br />
                    {orderData.shippingAddress?.city},{' '}
                    {orderData.shippingAddress?.state}{' '}
                    {orderData.shippingAddress?.zip},<br />
                    {orderData.shippingAddress?.country}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <h4 className='text-md font-semibold mb-2'>Item(s)</h4>

              {/* Order Items */}
              <div className='w-full grid grid-cols-1 xl:grid-cols-2 gap-6'>
                {orderData.orderItems.map((item) => (
                  <OrderItemDetails
                    key={item._id}
                    item={item}
                    orderId={orderData._id}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoreOrderDetailsModal;
