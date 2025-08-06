import RetailerLayout from '../layout';
import SellerCustomers from '@/components/SellerCustomers';

const RetailerCustomers = () => {
  return (
    <RetailerLayout>
      <SellerCustomers />
    </RetailerLayout>
  );
};

RetailerCustomers.noLayout = true;
export default RetailerCustomers;
