import UserNotifications from '@/components/Notifications/UserNotifications';
import ManufacturerLayout from '../layout';

const ManufacturerAccount = () => {

  return (
    <div>
      <ManufacturerLayout>
        <UserNotifications />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerAccount.noLayout = true;
export default ManufacturerAccount;
