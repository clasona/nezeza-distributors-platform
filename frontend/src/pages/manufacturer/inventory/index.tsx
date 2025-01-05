import React from 'react';
import ManufacturerLayout from '../layout';
import SellerInventory from '@/components/SellerInventory';
import SellerProducts from '@/components/SellerProducts';

const ManufacturerInventory = () => {
  return (
    <ManufacturerLayout>
      <SellerInventory />
    </ManufacturerLayout>
  );
};

ManufacturerInventory.noLayout = true;
export default ManufacturerInventory;
