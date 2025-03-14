import RetailerLayout from '../layout';
import SellerCustomers from '@/components/SellerCustomers';

const RetailerCustomers = () => {
  return (
    <div>
      <RetailerLayout>
        <SellerCustomers />
      </RetailerLayout>
    </div>
  );
};

RetailerCustomers.noLayout = true;
export default RetailerCustomers;
