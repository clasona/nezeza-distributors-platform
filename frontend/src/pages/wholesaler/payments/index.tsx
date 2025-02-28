import UserPayments from '@/components/Payments/UserPayments';
import WholesalerLayout from '../layout';

const WholesalerAccount = () => {
  return (
    <div>
      <WholesalerLayout>
        <UserPayments />
      </WholesalerLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
