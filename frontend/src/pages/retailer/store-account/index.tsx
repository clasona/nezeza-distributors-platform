import RetailerLayout from '../layout';
import StoreAccount from '@/components/Account/StoreAccount';

const RetailerStoreAccount = () => {
  return (
    <div>
      <RetailerLayout>
        <StoreAccount />
      </RetailerLayout>
    </div>
  );
};

RetailerStoreAccount.noLayout = true;
export default RetailerStoreAccount;
