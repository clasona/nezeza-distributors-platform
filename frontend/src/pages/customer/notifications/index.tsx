import UserNotifications from '@/components/Notifications/UserNotifications';
import RootLayout from '@/components/RootLayout';

const CustomerAccount = () => {
  return (
    <div>
      <RootLayout>
        <UserNotifications/>
      </RootLayout>
    </div>
  );
};

CustomerAccount.noLayout = true;
export default CustomerAccount;
