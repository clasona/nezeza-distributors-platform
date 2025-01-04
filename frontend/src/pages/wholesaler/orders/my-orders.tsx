import React from 'react';
import WholesalerLayout from '..';
import SellerMyOrders from '@/components/SellerMyOrders';
import SellerProducts from '@/components/SellerProducts';

const WholesalerMyOrders = () => {
  return (
    <WholesalerLayout>
      <SellerMyOrders />
    </WholesalerLayout>
  );
};

WholesalerMyOrders.noLayout = true;
export default WholesalerMyOrders;
