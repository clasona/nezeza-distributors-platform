import UserPayments from '@/components/Payments/UserPayments';
import ManufacturerLayout from '../layout';

const ManufacturerAccount = () => {
  return (
    <div>
      <ManufacturerLayout>
        <UserPayments />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerAccount.noLayout = true;
export default ManufacturerAccount;
