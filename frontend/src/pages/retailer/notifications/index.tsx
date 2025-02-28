import UserNotifications from '@/components/Notifications/UserNotifications';
import RetailerLayout from '../layout';

const RetailerAccount = () => {

  return (
    <div>
      <RetailerLayout>
        <UserNotifications />
      </RetailerLayout>
    </div>
  );
};

RetailerAccount.noLayout = true;
export default RetailerAccount;
