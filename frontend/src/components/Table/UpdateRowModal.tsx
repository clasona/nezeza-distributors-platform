import React, { useEffect, useState } from 'react';
import { InventoryProps, OrderProps } from '../../../type';

interface UpdateModalProps<T> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onSave: (updatedData: T) => void;
}

const UpdateRowModal = <T,>({
  isOpen,
  rowData,
  onClose,
  onSave,
}: UpdateModalProps<T>) => {
  const [formData, setFormData] = useState<T>(rowData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State for confirmation dialog

  // console.log('semg', rowData);
  // Log formData whenever it changes to help with debugging
  useEffect(() => {
    console.log('Received rowData:', rowData);
    if (isOpen) {
      setFormData(rowData);
    }
  }, [isOpen, rowData]); // This effect runs whenever `isOpen` or `rowData` changes

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  // Handle confirmation of save
  const handleConfirmSave = () => {
    onSave(formData);
    //TODO: Save in the db as well
    console.log('sooo', formData);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelSave = () => {
    setShowConfirmDialog(false); // Close confirmation dialog without saving
  };
  //checks if the data is of type OrderProps by verifying the existence of the fulfillmentStatus field.
  const isOrderProps = (data: any): data is OrderProps =>
    'fulfillmentStatus' in data;

  //checks if the data is of type InventoryProps by verifying the presence of stock and price.
  const isInventoryProps = (data: any): data is InventoryProps =>
    'stock' in data && 'price' in data;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-1/4 max-w-3xl'>
        <form onSubmit={handleSubmit}>
          {isOrderProps(formData) && (
            <>
              <h2 className='text-lg font-semibold mb-4'>Update Order</h2>
              <div className='mb-4'>
                <label className='block text-lg font-medium text-gray-700'>
                  Order #:{' '}
                  <span className=' px-2 text-lg font-bold text-nezeza_dark_blue'>
                    {formData._id}
                  </span>
                </label>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Status
                </label>
                <select
                  name='fulfillmentStatus'
                  value={formData.fulfillmentStatus}
                  onChange={handleChange}
                  className='mt-1 px-12 py-2 border border-gray-300 rounded-md w-full'
                >
                  <option value=''>Select Status</option>
                  <option value='Pending'>Pending</option>
                  <option value='Fulfilled'>Fulfilled</option>
                  <option value='Shipped'>Shipped</option>
                  <option value='Delivered'>Delivered</option>
                  <option value='Completed'>Completed</option>
                  <option value='Canceled'>Canceled</option>
                </select>
              </div>
            </>
          )}
          {/* <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Stock (Inventory only)
            </label>
            <input
              type='number'
              name='stock'
              value={formData._id}
              onChange={handleChange}
              className='mt-1 px-3 py-2 border border-gray-300 rounded-md w-full'
            />
          </div> */}
          {isInventoryProps(formData) && (
            <>
              <h2 className='text-lg font-semibold mb-4'>Update Inventory</h2>
              <div className='mb-4'>
                <label className='block text-lg font-medium text-gray-700'>
                  Product #:{' '}
                  <span className=' px-2 text-lg font-bold text-nezeza_dark_blue'>
                    {formData._id}
                  </span>
                </label>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Stock
                </label>
                <input
                  name='stock'
                  type='number'
                  value={formData.stock || ''}
                  onChange={handleChange}
                  className='mt-1 px-3 py-2 border border-gray-300 rounded-md w-full'
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Price
                </label>
                <input
                  name='price'
                  type='number'
                  //   step='0.01'
                  value={formData.price || ''}
                  onChange={handleChange}
                  className='mt-1 px-3 py-2 border border-gray-300 rounded-md w-full'
                />
              </div>
            </>
          )}
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='mr-4 text-nezeza_gray_600 hover:text-gray-700'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-nezeza_green_600 text-white px-4 py-2 rounded-md hover:bg-nezeza_green_800'
            >
              Confirm Changes
            </button>
          </div>
        </form>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
            <h3 className='text-lg font-semibold mb-4'>Confirm Changes</h3>
            <p className='mb-4'>Are you sure you want to save the changes?</p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={handleCancelSave}
                className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className='px-4 py-2 text-white bg-nezeza_green_600 rounded-md'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateRowModal;
