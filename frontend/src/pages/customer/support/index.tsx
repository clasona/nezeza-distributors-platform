import RootLayout from '@/components/RootLayout';
import UserSupport from '@/components/Support/UserSupport';

const CustomerSupport = () => {
  return (
    <div>
      <RootLayout>
        <UserSupport />
      </RootLayout>
    </div>
  );
};

CustomerSupport.noLayout = true;
export default CustomerSupport;
