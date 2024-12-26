'use client';

import React, { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import SideNavbar from '@/components/SideNavbar';
import TopNavbar from '@/components/TopNavbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Providers from '@/context/Providers';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';
// import { AppSidebar } from '@/components/app-sidebar';

const ManufacturerLayout = ({ children }: PropsWithChildren<{}>) => {
  const [showSidebar, setShowSidebar] = useState(true); //TODO: make false

  // get store info from redux
  const { storeInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div className='flex'>
      <SideNavbar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        basePath='/manufacturer'
      />
      <div className='w-full'>
        <TopNavbar
          storeName={storeInfo._id}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <main
          className={`${
            showSidebar
              ? 'ml-60 p-8 bg-slate-300 dark:bg-slate-900 text-nezeza_light_slate min-h-screen mt-16'
              : 'p-8 bg-slate-300 dark:bg-slate-900 text-nezeza_light_slate min-h-screen mt-16'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
ManufacturerLayout.noLayout = true;
export default ManufacturerLayout;
