import React from 'react';
import { InventoryProps, OrderProps, stateProps } from '../../../type';
import { useSelector } from 'react-redux';
import { archiveOrder } from '@/utils/order/archiveOrder';

interface ArchiveModalProps<T extends object> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onArchive: (id: number | string) => void;
}

const ArchiveRowModal = <T extends { _id: number | string }>({
  isOpen,
  rowData,
  onClose,
  onArchive,
}: ArchiveModalProps<T>) => {
  if (!isOpen) return null;

  const handleArchive = async () => {
    if ('_id' in rowData) {
      onArchive(rowData._id);
      // const orderData: Partial<OrderProps> = {
      //   fulfillmentStatus: 'Archived',
      // };
      // if (rowData._id) {
      //   await archiveOrder(rowData._id as string, orderData);
      // }

      onClose(); // Close the modal after deletion
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Archive</h3>
        {/* {isOrderProps(rowData) && ( */}
        <p className='mb-4'>
          Are you sure you want to archive the order with ID #{' '}
          <span className='font-bold text-vesoko_dark_blue'>{rowData._id}</span>
          ? <br />
          This action cannot be undone.
        </p>
        {/* )} */}
        {/* {isInventoryProps(rowData) && (
          <p className='mb-4'>
            Are you sure you want to delete the inventory item with ID{' '}
            <span className='font-bold text-vesoko_dark_blue'>
              {rowData._id}
            </span>
            ? <br />
            This action cannot be undone.
          </p>
        )} */}
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-vesoko_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleArchive}
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveRowModal;
