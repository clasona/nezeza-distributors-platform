import SellerInventory from '@/components/SellerInventory';
import ManufacturerLayout from '../layout';

const ManufacturerInventory = () => {
  return (
    <ManufacturerLayout>
      <SellerInventory />
    </ManufacturerLayout>
  );
};

ManufacturerInventory.noLayout = true;
export default ManufacturerInventory;
