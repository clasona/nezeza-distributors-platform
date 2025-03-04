import SellerInventory from '@/components/SellerInventory';
import RetailerLayout from '../layout';

const RetailerInventory = () => {
  return (
    <RetailerLayout>
      <SellerInventory />
    </RetailerLayout>
  );
};

RetailerInventory.noLayout = true;
export default RetailerInventory;
