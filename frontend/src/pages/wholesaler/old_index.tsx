import React, { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import SideNavbar from '@/components/SideNavbar';
import TopNavbar from '@/components/TopNavbar';

const WholesalerLayout = ({ children }: PropsWithChildren<{}>) => {
  
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

      return (
        <main>
          <div>
            <button onClick={toggleSidebar}>Toggle Sidebar</button>
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
          </div>
        </main>
      );
};
WholesalerLayout.noLayout = true;
export default WholesalerLayout;
