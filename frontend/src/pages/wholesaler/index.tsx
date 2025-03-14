import SellerDashboard from '@/components/SellerDashboard';
import WholesalerLayout from './layout';

const WholesalerDashboard = () => {
  return (
    <div>
      <WholesalerLayout>
        <SellerDashboard />
      </WholesalerLayout>
    </div>
  );
};

WholesalerDashboard.noLayout = true;
export default WholesalerDashboard;
