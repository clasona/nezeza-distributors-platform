// For the page apsects that remain static when you scroll like the header etc

import React, { ReactElement, useEffect, useState } from 'react';
import Header from '@/components/header/Header';
import HeaderBottom from '@/components/header/HeaderBottom';
import Footer from '@/components/Footer';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import CustomerSideNavbar from './CustomerSideNavbar';
import FullScreenLoader from './Loaders/FullScreenLoader';

interface Props {
  children: ReactElement;
}
const RootLayout = ({ children }: Props) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const [showSidebar, setShowSidebar] = useState(true); //TODO: make false

  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Determine when your data loading is complete.  This is a placeholder.
    // Replace this logic with your actual data fetching/processing.
    const dataLoaded = !!userInfo && !!storeInfo; // Example: Data is loaded when both userInfo and storeInfo are available

    if (dataLoaded) {
      setIsLoading(false);
    } else {
      // If needed, you can add a timeout or other condition to set isLoading to false after a certain time, even if data isn't fully loaded.
      // This is helpful if you want to prevent a perpetually loading screen in case of errors.
      const timeout = setTimeout(() => {
        setIsLoading(false); // Set to false after a timeout (e.g., 10 seconds)
        console.warn('Data loading timed out.');
      }, 10000);

      return () => clearTimeout(timeout); // Clear the timeout if data loads before it.
    }
  }, [userInfo, storeInfo]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className='flex flex-col min-h-screen bg-nezeza_powder_blue'>
      <Header />
      <HeaderBottom showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className='flex flex-1'>
        {/* {userInfo && !storeInfo && (
          <>
            No store info, means logged in user is customer" */}
        {/* <CustomerSideNavbar
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              basePath='/user'
            /> 
          </>
        )}
         <main
          className={`flex-1 transition-all duration-300 p-4 
          ${userInfo && !storeInfo && showSidebar ? 'ml-24' : 'ml-0'
          }`}
        > */}
        <main className='flex-1 transition-all duration-300 p-4'>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default RootLayout;
