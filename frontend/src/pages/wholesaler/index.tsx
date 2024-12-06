'use client'

import React, { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import SideNavbar from '@/components/SideNavbar';
import TopNavbar from '@/components/TopNavbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Providers from '@/context/Providers';
// import { AppSidebar } from '@/components/app-sidebar';

const WholesalerLayout = ({ children }: PropsWithChildren<{}>) => {
  const [showSidebar, setShowSidebar] = useState(true);  //TODO: make false

  return (
    <div className='flex'>
      <SideNavbar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className='w-full'>
        <TopNavbar
          storeName='(Wholesaler Store Name)'
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
          {/* <Providers> {children} </Providers> */}

          {/* For the dark mode in sellers dashboard using next-themes

      {/* <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            // enableSystem
            // disableTransitionOnChange
          >
            {children}
          </ThemeProvider> */}
        </main>
      </div>
      {/* <SidebarProvider>
        <SideNavbar />

        <div >
          <TopNavbar storeName='(Wholesaler Store Name)' />
        </div>
        <main className='p-8 bg-slate-300 dark:bg-slate-900 text-nezeza_light_slate min-h-screen mt-16'>
          {children}
        </main>
      </SidebarProvider> */}
    </div>
  );
};
WholesalerLayout.noLayout = true;
export default WholesalerLayout;
