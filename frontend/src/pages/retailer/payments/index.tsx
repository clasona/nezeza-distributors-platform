import UserPayments from '@/components/Payments/UserPayments';
import RetailerLayout from '../layout';

const RetailerAccount = () => {
  return (
    <div>
      <RetailerLayout>
        <UserPayments />
      </RetailerLayout>
    </div>
  );
};

RetailerAccount.noLayout = true;
export default RetailerAccount;
