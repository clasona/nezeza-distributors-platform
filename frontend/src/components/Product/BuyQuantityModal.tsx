// components/QuantityModal.tsx (Create this new file)
import React, { useState } from 'react';
import Button from '../FormInputs/Button';
import { ProductProps } from '../../../type';

interface BuyQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductProps;
  onConfirm: (quantity: number) => void;
  maxQuantity: number; // To prevent buying more than available stock
}

const BuyQuantityModal: React.FC<BuyQuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  maxQuantity,
}) => {
  const [quantity, setQuantity] = useState(1); // Default quantity is 1

  if (!isOpen) return null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity); // Cap at max available
    } else if (value < 1) {
      setQuantity(1); // Minimum 1
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto'>
        <h2 className='text-xl font-bold mb-4'>
          Enter Quantity for {product.title}
        </h2>
        <div className='flex items-center justify-center space-x-3 mb-6'>
          <Button
            buttonTitle='-'
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className='bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-md'
          />
          <input
            type='number'
            min='1'
            max={maxQuantity}
            value={quantity}
            onChange={handleQuantityChange}
            className='w-24 p-2 border border-gray-300 rounded-md text-center text-lg font-semibold'
          />
          <Button
            buttonTitle='+'
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity}
            className='bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-md'
          />
        </div>
        {/* Display running low in stock, if stock below 200 */}
        {maxQuantity < 200 && (
          <p className='text-red-600 font-semibold text-center mb-4'>
            Running low in stock, order now!
          </p>
        )}

        <div className='flex justify-end space-x-3'>
          <Button
            buttonTitle='Cancel'
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
          />
          <Button
            buttonTitle='Confirm'
            onClick={handleConfirm}
            disabled={quantity < 1 || quantity > maxQuantity}
            className='px-4 py-2 bg-nezeza_dark_blue text-white rounded-md hover:bg-nezeza_dark_blue_2'
          />
        </div>
      </div>
    </div>
  );
};

export default BuyQuantityModal;
