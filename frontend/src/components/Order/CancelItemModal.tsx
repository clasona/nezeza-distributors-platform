import React, { useEffect, useState } from 'react';

interface CancelItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (quantity: number, reason: string) => void;
  defaultQuantity: number;
  maxQuantity: number;
  cancelledQuantity: number;
  title?: string;
  /**
   * Optional: Provide your own cancel reasons, otherwise default is used
   */
  reasonsList?: string[];
}

const DEFAULT_REASONS = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Item would not arrive on time',
  'Need to change shipping address',
  'Other',
];

const CancelItemModal: React.FC<CancelItemModalProps> = ({
  open,
  onClose,
  onSubmit,
  defaultQuantity,
  maxQuantity,
  cancelledQuantity,
  title = 'How many would you like to cancel?',
  reasonsList = DEFAULT_REASONS,
}) => {
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    setQuantity(defaultQuantity);
    setReason('');
  }, [defaultQuantity, open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-md w-80'>
        <h3 className='text-lg font-semibold mb-4'>{title}</h3>
        {cancelledQuantity > 0 && (
          <div className='mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-2 text-yellow-800 text-sm rounded'>
            You’ve already cancelled <strong>{cancelledQuantity}</strong>{' '}
            {cancelledQuantity === 1 ? 'item' : 'items'} from this order item.
          </div>
        )}
        <div className='mb-3 bg-red-50 border-l-4 border-red-400 p-2 text-red-800 text-sm rounded'>
          <strong>Warning:</strong> This action cannot be undone.
        </div>
        <input
          type='number'
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className='w-full border border-gray-300 rounded-md p-2 mb-4'
        />
        <select
          className='w-full border border-gray-300 rounded-md p-2 mb-4 bg-white'
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
        <div className='flex justify-end gap-2'>
          <button
            className='px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer'
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className='px-4 py-1 bg-vesoko_primary text-white rounded hover:bg-vesoko_primary_2 cursor-pointer transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={() => onSubmit(quantity, reason)}
            disabled={
              quantity < 1 ||
              quantity > maxQuantity ||
              reason.trim().length === 0
            }
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelItemModal;
