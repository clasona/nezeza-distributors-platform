import WholesalerLayout from '../layout';
import SellerCustomers from '@/components/SellerCustomers';

const WholesalerCustomers = () => {
  return (
    <div>
      <WholesalerLayout>
        <SellerCustomers />
      </WholesalerLayout>
    </div>
  );
};

WholesalerCustomers.noLayout = true;
export default WholesalerCustomers;
