/*
Admin can:
- Users - getAllUsers, getSingleUser, updateUser, deleteUser
- Stores - getAllStores, getSingleStore, updateStore, deleteStore
- Get store applications, review them and approve/decline them
*/

'use client';

import SideNavbar from '@/components/Admin/SideNavbar';
import { PropsWithChildren, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

const AdminLayout = ({ children }: PropsWithChildren<{}>) => {
  const [showSidebar, setShowSidebar] = useState(true); //TODO: make false

  const { storeInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div className='flex'>
      <SideNavbar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        basePath='/admin'
      />
      <div className='w-full'>
        <main
          className={`${
            showSidebar
              ? 'ml-60 p-8 bg-slate-300 dark:bg-slate-900 text-vesoko_light_slate min-h-screen'
              : 'p-8 bg-slate-300 dark:bg-slate-900 text-vesoko_light_slate min-h-screen'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
AdminLayout.noLayout = true;
export default AdminLayout;
