import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Book, UsersRound, Store, ShoppingCart, Truck, CircleDollarSign, MessageSquare, UserRoundPen, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogoutButton } from '../LogoutButton';
import logo from '../../images/main.png';
import { usePathname } from 'next/navigation';

interface SideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  basePath: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ showSidebar, setShowSidebar, basePath, collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const sidebarLinks = [
    { title: 'Dashboard', href: basePath, icon: LayoutDashboard },
    { title: 'Store Applications', href: basePath + '/store-applications', icon: Book },
    { title: 'Users', href: basePath + '/users', icon: UsersRound },
    { title: 'Stores', href: basePath + '/stores', icon: Store },
    { title: 'Products', href: basePath + '/products', icon: ShoppingCart },
    { title: 'Orders', href: basePath + '/orders', icon: Truck },
    { title: 'Payments', href: basePath + '/payments', icon: CircleDollarSign },
    { title: 'Support', href: basePath + '/support', icon: MessageSquare },
    { title: 'My Account', href: basePath + '/my-account', icon: UserRoundPen },
  ];

  return (
    <aside
      className={`bg-vesoko_primary ${collapsed ? 'w-16' : 'w-56'} h-screen text-white fixed left-0 top-0 shadow-lg flex flex-col z-30 transition-all duration-200 ${showSidebar ? 'sm:flex' : 'hidden sm:flex'}`}
    >
      {/* Collapse/Expand Button */}
      <button
        className="absolute top-4 right-[-16px] bg-vesoko_primary border border-white/10 rounded-full p-1 shadow hover:bg-vesoko_primary transition-colors z-40"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
      <div className={`flex flex-col items-center py-6 border-b border-white/10 ${collapsed ? 'px-0' : ''}`}>
        <Link href="/admin" className="mb-2">
          <Image className={`${collapsed ? 'w-10 h-10' : 'w-28 h-12'} object-contain`} src={logo} alt="logoImg" />
        </Link>
        {!collapsed && <span className="text-lg font-bold tracking-wide text-vesoko_primary">Admin</span>}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {sidebarLinks.map((item) => {
            const isActive = item.href === pathname;
            const Icon = item.icon;
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg transition-colors text-sm font-medium
                    ${isActive ? 'bg-vesoko_primary text-white shadow border-l-4 border-[#ff7a00]' : 'hover:bg-vesoko_primary/30 hover:text-vesoko_primary'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto px-4 pb-6">
        <LogoutButton className={`w-full py-2 bg-vesoko_red_600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors ${collapsed ? 'px-0 text-xs' : ''}`} />
      </div>
    </aside>
  );
};

export default SideNavbar;
