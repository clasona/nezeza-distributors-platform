
import SideNavbar from '@/components/Admin/SideNavbar';
import AdminTopNavbar from '@/components/Admin/AdminTopNavbar';
import React, { useState, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [showSidebar, setShowSidebar] = useState(true); // Sidebar toggle
  const [collapsed, setCollapsed] = useState(false); // Sidebar collapse
  const { storeInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div className='flex flex-col min-h-screen'>
      <AdminTopNavbar />
      <div className='flex flex-1 pt-16'>
        <SideNavbar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          basePath='/admin'
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <div className={`w-full transition-all duration-200 ${showSidebar && !collapsed ? 'ml-56' : showSidebar && collapsed ? 'ml-16' : ''}`}> 
          <main
            className={`p-8 bg-slate-300 dark:bg-slate-900 text-vesoko_secondary_slate min-h-screen`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
