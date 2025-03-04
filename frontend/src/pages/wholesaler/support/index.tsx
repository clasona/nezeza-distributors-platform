import WholesalerLayout from '../layout';
import UserSupport from '@/components/Support/UserSupport';

const WholesalerSupport = () => {
  return (
    <div>
      <WholesalerLayout>
        <UserSupport />
      </WholesalerLayout>
    </div>
  );
};

WholesalerSupport.noLayout = true;
export default WholesalerSupport;
