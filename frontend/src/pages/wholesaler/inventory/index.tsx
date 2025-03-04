import SellerInventory from '@/components/SellerInventory';
import WholesalerLayout from '../layout';

const WholesalerInventory = () => {
  return (
    <WholesalerLayout>
      <SellerInventory />
    </WholesalerLayout>
  );
};

WholesalerInventory.noLayout = true;
export default WholesalerInventory;
