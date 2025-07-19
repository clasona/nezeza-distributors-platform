import RootLayout from '@/components/RootLayout';
import UserSupport from '@/components/Support/UserSupport';

const CustomerSupport = () => {
  return (
    <RootLayout>
      <div className='max-w-3xl mx-auto py-8'>
        <UserSupport />
      </div>
    </RootLayout>
  );
};

CustomerSupport.noLayout = true;
export default CustomerSupport;
