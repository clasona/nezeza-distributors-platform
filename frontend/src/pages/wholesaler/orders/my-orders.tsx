import SellerMyOrders from '@/components/SellerMyOrders';
import WholesalerLayout from '../layout';

const WholesalerMyOrders = () => {
  return (
    <WholesalerLayout>
      <SellerMyOrders />
    </WholesalerLayout>
  );
};

WholesalerMyOrders.noLayout = true;
export default WholesalerMyOrders;
