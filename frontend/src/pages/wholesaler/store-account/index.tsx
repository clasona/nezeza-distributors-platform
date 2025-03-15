import WholesalerLayout from '../layout';
import StoreAccount from '@/components/Account/StoreAccount';

const WholesalerStoreAccount = () => {
  return (
    <div>
      <WholesalerLayout>
        <StoreAccount />
      </WholesalerLayout>
    </div>
  );
};

WholesalerStoreAccount.noLayout = true;
export default WholesalerStoreAccount;
