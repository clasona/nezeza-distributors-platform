
import ManufacturerLayout from '../layout';
import UserSupport from '@/components/Support/UserSupport';

const ManufacturerSupport = () => {
  return (
    <div>
      <ManufacturerLayout>
        <UserSupport />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerSupport.noLayout = true;
export default ManufacturerSupport;
