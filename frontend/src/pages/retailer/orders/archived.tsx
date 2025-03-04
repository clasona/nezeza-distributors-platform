import SellerMyOrdersArchived from '@/components/SellerMyOrdersArchived';
import RetailerLayout from '../layout';

const RetailerMyOrdersArchived = () => {
  return (
    <RetailerLayout>
      <SellerMyOrdersArchived />
    </RetailerLayout>
  );
};

RetailerMyOrdersArchived.noLayout = true;
export default RetailerMyOrdersArchived;
