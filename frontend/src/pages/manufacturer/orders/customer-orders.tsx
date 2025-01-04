import React from 'react';
import ManufacturerLayout from '..';
import SellerCustomerOrders from '@/components/SellerCustomerOrders';
import SellerProducts from '@/components/SellerProducts';

const ManufacturerCustomerOrders = () => {
  return (
    <ManufacturerLayout>
      <SellerCustomerOrders />
    </ManufacturerLayout>
  );
};

ManufacturerCustomerOrders.noLayout = true;
export default ManufacturerCustomerOrders;
