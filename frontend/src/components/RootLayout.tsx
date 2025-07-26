// For the page apsects that remain static when you scroll like the header etc

import Footer from '@/components/Footer';
import Header from '@/components/header/Header';
import HeaderBottom from '@/components/header/HeaderBottom';
import { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import FullScreenLoader from './Loaders/FullScreenLoader';

interface Props {
  children: ReactElement;
}
const RootLayout = ({ children }: Props) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const [showSidebar, setShowSidebar] = useState(true); //TODO: make false

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataLoaded = !!userInfo && !!storeInfo;

    if (dataLoaded) {
      setIsLoading(false);
    } else {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        console.warn('Data loading timed out.');
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [userInfo, storeInfo]);

  // if (isLoading) {
  //   return <FullScreenLoader />;
  // }

  return (
    <div className='flex flex-col min-h-screen bg-vesoko_powder_blue'>
      <Header />
      <HeaderBottom
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
      <div className='flex flex-1'>
        {/* {userInfo && !storeInfo && (
          <>
            No store info, means logged in user is customer" */}
        {/* <CustomerSideNavbar
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              basePath='/customer'
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
