import SellerDashboard from '@/components/SellerDashboard';
import RetailerLayout from './layout';

const RetailerDashboard = () => {
  return (
    <div>
      <RetailerLayout>
        <SellerDashboard />
      </RetailerLayout>
    </div>
  );
};

RetailerDashboard.noLayout = true;
export default RetailerDashboard;
