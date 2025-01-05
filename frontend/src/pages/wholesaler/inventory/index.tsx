import React from 'react';
import WholesalerLayout from '../layout';
import SellerInventory from '@/components/SellerInventory';

const WholesalerInventory = () => {
  return (
    <WholesalerLayout>
      <SellerInventory />
    </WholesalerLayout>
  );
};

WholesalerInventory.noLayout = true;
export default WholesalerInventory;
