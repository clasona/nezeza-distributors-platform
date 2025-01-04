import React from 'react';
import ManufacturerLayout from '..';
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
