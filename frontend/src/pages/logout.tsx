// app/logout/page.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    signOut({ callbackUrl: '/' }); // Redirect to the login page after logging out
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-96'>
        <h1 className='text-2xl font-semibold mb-6'>Logging out...</h1>
      </div>
    </div>
  );
};

export default LogoutPage;
