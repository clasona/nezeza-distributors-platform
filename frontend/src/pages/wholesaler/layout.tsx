'use client';

import FullScreenLoader from '@/components/Loaders/FullScreenLoader';
import SideNavbar from '@/components/SideNavbar';
import TopNavbar from '@/components/TopNavbar';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

const WholesalerLayout = ({ children }: PropsWithChildren<{}>) => {
  const [showSidebar, setShowSidebar] = useState(true); //TODO: make false
  const [storeName, setStoreName] = useState('(Store Name Missing)');
  const [isLoading, setIsLoading] = useState(true);
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  useEffect(() => {
    try {
      if (storeInfo) {
        setStoreName(storeInfo.name);
      } else {
        setStoreName('');
      }
    } catch (error) {
      console.error('Error setting store name:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storeInfo]);

  // if (isLoading) {
  //   return <FullScreenLoader />;
  // }

  return (
    <div className='flex'>
      <SideNavbar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        basePath='/wholesaler'
      />
      <div className='w-full'>
        <TopNavbar
          storeName={storeName}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          basePath='wholesaler'
        />
        <main
          className={`${
            showSidebar
              ? 'sm:ml-60 p-4 sm:p-8 bg-nezeza_powder_blue dark:bg-slate-900 text-nezeza_light_slate min-h-screen mt-16'
              : 'p-4 sm:p-8 bg-nezeza_powder_blue dark:bg-slate-900 text-nezeza_light_slate min-h-screen mt-16'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
WholesalerLayout.noLayout = true;
export default WholesalerLayout;
