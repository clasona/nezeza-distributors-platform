'use client';

import FullScreenLoader from '@/components/Loaders/FullScreenLoader';
import SideNavbar from '@/components/SideNavbar';
import TopNavbar from '@/components/TopNavbar';
import PageTransition from '@/components/PageTransition';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

const WholesalerLayout = ({ children }: PropsWithChildren<{}>) => {
  // Responsive sidebar state - hidden on mobile by default, visible on desktop
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { storeInfo, userInfo } = useSelector((state: stateProps) => state.next);

  // Initialize sidebar visibility based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    // Set initial state
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Simulate loading for smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [storeInfo, userInfo]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-blue-50 to-white'>
      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
          onClick={() => setShowSidebar(false)}
          aria-hidden='true'
        />
      )}

      {/* Sidebar */}
      <SideNavbar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        basePath='/wholesaler'
      />

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        showSidebar ? 'md:ml-64' : ''
      }`}>
        {/* Top Navigation */}
        <TopNavbar
          storeName={storeInfo?.name || ''}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          basePath='wholesaler'
        />

        {/* Main Content */}
        <main className='flex-1 overflow-auto pt-20'>
          <PageTransition>
            <div className='px-4 py-6 md:px-8 md:py-8'>
              {/* Content Container with responsive padding and max width */}
              <div className='max-w-7xl mx-auto'>
                {children}
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
WholesalerLayout.noLayout = true;
export default WholesalerLayout;
