import React from 'react';

interface StockProps {
  quantity: number;
}

const FormattedStock = ({ quantity }: StockProps) => {
  return (
    <span
      className={`px-2 py-1 text-sm font-medium rounded ${
        quantity <= 5
          ? 'bg-red-100 text-red-800'
          : 'bg-transparent'
      }`}
    >
      {quantity}
    </span>
  );
};

export default FormattedStock;
