import React from 'react';

const formatPrice = (price: number | string): string => {
  const parsedPrice = Number(price);

  if (isNaN(parsedPrice)) {
    return 'Invalid Price';
  }

  return parsedPrice.toFixed(2);
};

export default formatPrice;
