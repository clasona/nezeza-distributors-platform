import SellerCustomerOrders from '@/components/SellerCustomerOrders';
import ManufacturerLayout from '../layout';

const ManufacturerCustomerOrders = () => {
  return (
    <ManufacturerLayout>
      <SellerCustomerOrders />
    </ManufacturerLayout>
  );
};

ManufacturerCustomerOrders.noLayout = true;
export default ManufacturerCustomerOrders;
