import ManufacturerLayout from '../layout';
import StoreAccount from '@/components/Account/StoreAccount';

const ManufacturerStoreAccount = () => {
  return (
    <div>
      <ManufacturerLayout>
        <StoreAccount />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerStoreAccount.noLayout = true;
export default ManufacturerStoreAccount;
