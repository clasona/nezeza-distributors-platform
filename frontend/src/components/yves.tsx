import React from 'react';

interface RemoveModalProps<T> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onDelete: (id: number | string) => void;
}

const RemoveRowModal = <T,>({
  isOpen,
  rowData,
  onClose,
  onDelete,
}: RemoveModalProps<T>) => {
  if (!isOpen) return null;

  // Type guard for OrderProps
  const isOrderProps = (
    data: any
  ): data is { _id: number; fulfillmentStatus?: string } =>
    'fulfillmentStatus' in data;

  // Type guard for InventoryProps
  const isInventoryProps = (
    data: any
  ): data is { _id: number; stock?: number; price?: number } =>
    'stock' in data && 'price' in data;

  const handleDelete = () => {
    if ('_id' in rowData) {
      onDelete(rowData._id); // Execute delete with the row's ID
      onClose(); // Close the modal after deletion
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Delete</h3>
        {isOrderProps(rowData) && (
          <p className='mb-4'>
            Are you sure you want to delete the order with ID{' '}
            <span className='font-bold text-nezeza_dark_blue'>
              {rowData._id}
            </span>
            ? <br />
            This action cannot be undone.
          </p>
        )}
        {isInventoryProps(rowData) && (
          <p className='mb-4'>
            Are you sure you want to delete the inventory item with ID{' '}
            <span className='font-bold text-nezeza_dark_blue'>
              {rowData._id}
            </span>
            ? <br />
            This action cannot be undone.
          </p>
        )}
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md'
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveRowModal;
