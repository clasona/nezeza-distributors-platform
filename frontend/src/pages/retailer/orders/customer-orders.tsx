import SellerCustomerOrders from '@/components/SellerCustomerOrders';
import RetailerLayout from '../layout';

const RetailerCustomerOrders = () => {
  return (
    <RetailerLayout>
      <SellerCustomerOrders />
    </RetailerLayout>
  );
};

RetailerCustomerOrders.noLayout = true;
export default RetailerCustomerOrders;
