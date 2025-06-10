'use client';

import logo from '@/images/logo.jpg';
import {
  Archive,
  Bell,
  CircleDollarSign,
  CircleHelp,
  LayoutDashboard,
  ListOrdered,
  ShoppingCart,
  Truck,
  UserRoundPen,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { LogoutButton } from './LogoutButton';

interface SideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  basePath: string;
}

const SideNavbar = ({
  showSidebar,
  setShowSidebar,
  basePath,
}: SideNavbarProps) => {
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const pathname = usePathname();
  const { storeInfo } = useSelector((state: stateProps) => state.next);
  const router = useRouter();
  const storeType = storeInfo?.storeType;
  console.log('storeType', storeType);

  const sidebarLinks = [
    {
      title: 'Dashboard',
      href: `${basePath}`,
      icon: LayoutDashboard,
    },
    // {
    //   title: 'Dashboard',
    //   href: `${basePath}/dashboard`,
    //   icon: LayoutDashboard,
    // },
    {
      title: 'My Orders',
      href: `${basePath}/orders/my-orders`,
      icon: ListOrdered,
    },
    {
      title: 'Customer Orders',
      href: `${basePath}/orders/customer-orders`,
      icon: Truck,
    },
    {
      title: 'Inventory',
      href: `${basePath}/inventory`,
      icon: Warehouse,
    },
    {
      title: 'Payments',
      href: `${basePath}/payments`,
      icon: CircleDollarSign,
    },
    // TODO: Not sure if needed for MVP but definetely for future, could have it with submenu items
    // Link at 1:21 - https://www.youtube.com/watch?v=lnRe9qHFQlQ&list=PLDn5_2K0bUmfREsFv1nSHDbmHEX5oqI3Z&index=6&ab_channel=JBWEBDEVELOPER
    // {
    //   title: 'Categories ??',
    //   href: `${basePath}/categories`,
    //   icon: ChartBarStacked,
    // },
    // {
    //   title: 'Staff',
    //   href: `${basePath}/staff`,
    //   icon: Users,
    // },
    {
      title: 'Customers',
      href: `${basePath}/customers`,
      icon: UsersRound,
    },
    {
      title: 'Notifications',
      href: `${basePath}/notifications`,
      icon: Bell,
    },
    {
      title: 'My Account',
      href: `${basePath}/my-account`,
      icon: UserRoundPen,
    },
    {
      title: 'Store Account',
      href: `${basePath}/store-account`,
      icon: UserRoundPen,
    },
    {
      title: 'Shopping',
      href: '/',
      icon: ShoppingCart,
      // extraIcon: SquareArrowOutUpRight,
      // target: '_blank',
    },
    {
      title: 'Archived',
      href: `${basePath}/orders/archived`,
      icon: Archive,
    },
    {
      title: 'Support',
      href: `${basePath}/support`,
      icon: CircleHelp,
    },
  ];

  // Filter sidebar links based on store type to exclude My Orders, Shopping and Archivedfor the manufacturers
  const filteredLinks = sidebarLinks.filter(
    (link) =>
      !(
        storeType === 'manufacturing' &&
        (link.title === 'My Orders' ||
          link.title === 'Shopping' ||
          link.title === 'Archived')
      )
  );

  return (
    <div
      className={`${
        // TODO: add some styling for the sidebar side scroll at some point?
        showSidebar
          ? 'bg-nezeza_dark_blue space-y-6 w-60 h-screen text-slate-50 fixed left-0 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : 'bg-nezeza_dark_blue space-y-6 w-16 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
      } hidden sm:block`}
    >
      <div className=' px-6 py-2'>
        <Link href='#'>
          <Image className='w-36 ' src={logo} alt='logoImg ' />
        </Link>
      </div>

      <div className='flex flex-col space-y-2'>
        {/* TODO: We could group the related sidebar menu items, check SidebarNav Copy.tsx */}
        {filteredLinks.map((item) => (
          <Link
            // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
            key={item.title}
            href={item.href}
            // target={item.target}
            className={`${
              item.href == pathname
                ? 'flex items-center space-x-3 px-6 py-1 bg-nezeza_green_600 rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-6 py-1 rounded-md'
            }`}
          >
            <item.icon />
            <span>{item.title}</span>
            {/* {item.extraIcon && <item.extraIcon className='w-4 h-4 ' />}{' '} */}
          </Link>
        ))}

        <div className='flex px-6 py-8'>
          <LogoutButton className='py-2'/>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
