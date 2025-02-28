import SellerMyOrdersArchived from '@/components/SellerMyOrdersArchived';
import WholesalerLayout from '../layout';

const WholesalerMyOrdersArchived = () => {
  return (
    <WholesalerLayout>
      <SellerMyOrdersArchived />
    </WholesalerLayout>
  );
};

WholesalerMyOrdersArchived.noLayout = true;
export default WholesalerMyOrdersArchived;
