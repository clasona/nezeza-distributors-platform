import React, { useEffect, useState } from 'react';

interface CancelFullOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void; // No quantity for full order cancel
  orderId: string; // To display the order ID in the modal
  currentFulfillmentStatus: string; // Current fulfillment status of the order
  /**
   * Optional: Provide your own cancel reasons, otherwise default is used
   */
  reasonsList?: string[];
}

const DEFAULT_REASONS = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Item(s) would not arrive on time',
  'Need to change shipping address',
  'Other',
];

const CancelFullOrderModal: React.FC<CancelFullOrderModalProps> = ({
  open,
  onClose,
  onSubmit,
  orderId,
  currentFulfillmentStatus,
  reasonsList = DEFAULT_REASONS,
}) => {
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    // Reset reason when modal opens or orderId changes
    setReason('');
  }, [open, orderId]);

  if (!open) return null;

  // Determine if the order can be cancelled based on its status
  const canCancel =
    currentFulfillmentStatus === 'Pending' ||
    currentFulfillmentStatus === 'Partially Cancelled';

  // Determine if the order is already fully cancelled
  const isAlreadyCancelled = currentFulfillmentStatus === 'Cancelled';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-md w-96 max-w-full'>
        <h3 className='text-lg font-semibold mb-4 text-center'>
          Confirm Full Order Cancellation
        </h3>

        <div className='mb-4 text-center text-gray-700'>
          <p className='text-md'>
            You are about to cancel your entire Order ID:{' '}
            <strong>{orderId}</strong>.
          </p>

          {isAlreadyCancelled ? (
            <div className='mt-3 bg-green-50 border-l-4 border-green-400 p-2 text-green-800 text-sm rounded'>
              This order has already been **fully cancelled**.
            </div>
          ) : !canCancel ? (
            <div className='mt-3 bg-red-50 border-l-4 border-red-400 p-2 text-red-800 text-sm rounded'>
              This order cannot be cancelled as its current status is{' '}
              <strong>"{currentFulfillmentStatus}"</strong>. Only orders with
              status "Pending" or "Partially Cancelled" can be cancelled.
            </div>
          ) : (
            <div className='mt-3 bg-red-50 border-l-4 border-red-400 p-2 text-red-800 text-sm rounded'>
              **Warning:** This action cannot be undone and all items will be
              refunded (if applicable).
            </div>
          )}
        </div>

        {canCancel && ( // Only show reason selection if cancellation is allowed
          <select
            className='w-full border border-gray-300 rounded-md p-2 mb-4 bg-white focus:ring-blue-500 focus:border-blue-500'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          >
            <option value='' disabled>
              Select a reason for cancellation
            </option>
            {reasonsList.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        <div className='flex justify-end gap-3'>
          <button
            className='px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800 font-medium transition duration-300'
            onClick={onClose}
          >
            Go Back
          </button>
          <button
            className='px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={() => onSubmit(reason)}
            disabled={!canCancel || reason.trim().length === 0} // Disable if cannot cancel or no reason
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelFullOrderModal;
