import SellerDashboard from '@/components/SellerDashboard';
import ManufacturerLayout from './layout';

const ManufacturerDashboard = () => {
  return (
    <div>
      <ManufacturerLayout>
        <SellerDashboard />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerDashboard.noLayout = true;
export default ManufacturerDashboard;
