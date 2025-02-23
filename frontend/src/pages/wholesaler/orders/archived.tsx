import React from 'react';
import WholesalerLayout from '../layout';
import SellerMyOrdersArchived from '@/components/SellerMyOrdersArchived';
import SellerProducts from '@/components/SellerProducts';

const WholesalerMyOrdersArchived = () => {
  return (
    <WholesalerLayout>
      <SellerMyOrdersArchived />
    </WholesalerLayout>
  );
};

WholesalerMyOrdersArchived.noLayout = true;
export default WholesalerMyOrdersArchived;
