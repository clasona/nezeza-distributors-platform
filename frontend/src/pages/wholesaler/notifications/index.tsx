import UserNotifications from '@/components/Notifications/UserNotifications';
import WholesalerLayout from '../layout';

const WholesalerAccount = () => {

  return (
    <div>
      <WholesalerLayout>
        <UserNotifications />
      </WholesalerLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
