import RetailerLayout from '../layout';
import UserSupport from '@/components/Support/UserSupport';

const RetailerSupport = () => {
  return (
    <div>
      <RetailerLayout>
        <UserSupport />
      </RetailerLayout>
    </div>
  );
};

RetailerSupport.noLayout = true;
export default RetailerSupport;
