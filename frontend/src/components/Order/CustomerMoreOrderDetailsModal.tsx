import React, { useEffect, useState } from 'react';
import { OrderProps, SubOrderProps } from '../../../type';
import { calculateOrderItemsSubtotal } from '@/utils/order/calculateOrderItemsSubtotal';
import FormattedStatus from '../Table/FormattedStatus';
import { OrderItemDetails } from './OrderItemDetails';
import { CustomerOrderItemDetails } from './CustomerOrderItemDetails';
import { useForm } from 'react-hook-form';
import DropdownInput from '../FormInputs/DropdownInput';
import { getOrderFulfillmentStatuses } from '@/lib/utils';

interface CustomerMoreOrderDetailsModalProps<T> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onCancelOrder?: (orderId: string | string) => void;
  onArchiveOrder?: (orderId: string | string) => void;
  onViewInvoice?: (orderId: string | string) => void;
  onUpdateOrder?: (orderId: string | string, status: string) => void;
}

const CustomerMoreOrderDetailsModal = <T extends SubOrderProps>({
  isOpen,
  rowData,
  onClose,
  onCancelOrder,
  onArchiveOrder,
  onViewInvoice,
  onUpdateOrder,
}: CustomerMoreOrderDetailsModalProps<T>) => {
  if (!isOpen) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const [orderData, setOrderData] = useState<T>(rowData);

  const isOrderProps = (data: any): data is SubOrderProps =>
    'fulfillmentStatus' in data;

  useEffect(() => {
    console.log('Received rowData:', rowData);
    if (isOpen) {
      setOrderData(rowData);
    }
  }, [isOpen, rowData, setValue]);

  const handleUpdateOrder = () => {
    const newStatus = getValues('fulfillmentStatus');
    if (onUpdateOrder) {
      onUpdateOrder(orderData._id, newStatus);
    }
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'
    >
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-full max-w-7xl'>
        <div className='flex justify-between items-center mb-4'>
          <h3 id='modal-title' className='text-lg font-semibold'>
            Customer Order Details
          </h3>
          {/* Action Buttons */}
          <div className='space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-300 text-vesoko_gray_600 rounded-md hover:bg-gray-400 transition'
            >
              Close
            </button>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between'>
            <p>
              Order #:{' '}
              <span className='font-bold text-vesoko_dark_blue'>
                {orderData._id}
              </span>
            </p>
            <p>
              <DropdownInput
                label='Fulfillment Status'
                id='fulfillmentStatus'
                name='fulfillmentStatus'
                options={getOrderFulfillmentStatuses()}
                register={register}
                errors={errors}
                value={orderData.fulfillmentStatus}
              />
            </p>
            <p>
              Order Date:{' '}
              <span className='font-bold text-vesoko_dark_blue'>
                {orderData.createdAt}
              </span>
            </p>
          </div>

          {/* Order Items */}
          <h4 className='text-md font-semibold mb-2'>Order Item(s)</h4>

          <div className='w-full grid grid-cols-1 xl:grid-cols-2 gap-6'>
            {orderData.products.map((item) => (
              <CustomerOrderItemDetails key={item._id} item={item} />
            ))}
          </div>
        </div>
        <div className='text-end'>
          <button
            onClick={handleUpdateOrder}
            className={
              'px-4 py-2 text-white bg-vesoko_green_600 hover:bg-vesoko_green_800 rounded-md'
            }
          >
            Update Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerMoreOrderDetailsModal;
