import SellerCustomerOrders from '@/components/SellerCustomerOrders';
import WholesalerLayout from '../layout';

const WholesalerCustomerOrders = () => {
  return (
    <WholesalerLayout>
      <SellerCustomerOrders />
    </WholesalerLayout>
  );
};

WholesalerCustomerOrders.noLayout = true;
export default WholesalerCustomerOrders;
