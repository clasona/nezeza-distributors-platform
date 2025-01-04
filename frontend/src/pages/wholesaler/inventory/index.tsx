import React from 'react';
import WholesalerLayout from '..';
import SellerInventory from '@/components/SellerInventory';

const WholesalerInventory = () => {
  

  return (
    <WholesalerLayout>
     <SellerInventory/>
    </WholesalerLayout>
  );
};

WholesalerInventory.noLayout = true;
export default WholesalerInventory;
