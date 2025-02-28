import SellerMyOrders from '@/components/SellerMyOrders';
import RetailerLayout from '../layout';

const RetailerMyOrders = () => {
  return (
    <RetailerLayout>
      <SellerMyOrders />
    </RetailerLayout>
  );
};

RetailerMyOrders.noLayout = true;
export default RetailerMyOrders;
