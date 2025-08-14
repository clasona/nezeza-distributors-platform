import Link from 'next/link';
import { Lock, ShoppingBag, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className='flex flex-col flex-grow items-center justify-center p-8 w-full bg-vesoko_primary min-h-screen'>
      <div className='bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center'>
        <div className='mb-6'>
          <Lock className='text-6xl text-red-500 mx-auto' />
        </div>
        <h1 className='text-2xl font-semibold mb-4 text-gray-800'>
          Unauthorized Access
        </h1>
        <p className='text-lg text-gray-600 mb-8'>
          You do not have permission to view this page.
        </p>
        <div className='flex flex-col gap-4'>
          <Link
            href='/'
            className='flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white text-lg font-medium rounded-md shadow-md hover:bg-vesoko_primary hover:shadow-lg transition duration-300'
          >
            <ShoppingBag className='mr-2' />
            Go to Shopping
          </Link>
          <Link
            href='/login'
            className='flex items-center justify-center px-6 py-3 bg-vesoko_primary text-white text-lg font-medium rounded-md shadow-md hover:bg-vesoko_primary hover:shadow-lg transition duration-300'
          >
            <LogIn className='mr-2' />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

UnauthorizedPage.noLayout = true;
export default UnauthorizedPage;
