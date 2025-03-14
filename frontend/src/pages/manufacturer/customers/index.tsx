import ManufacturerLayout from '../layout';
import SellerCustomers from '@/components/SellerCustomers';

const ManufacturerCustomers = () => {
  return (
    <div>
      <ManufacturerLayout>
        <SellerCustomers />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerCustomers.noLayout = true;
export default ManufacturerCustomers;
