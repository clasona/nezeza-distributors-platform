'use client';

import React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Disclosure } from '@headlessui/react';
import {
  MdOutlineSpaceDashboard,
  MdOutlineAnalytics,
  MdInventory,
  MdShoppingCart,
  MdOutlineIntegrationInstructions,
  MdOutlineMoreHoriz,
  MdOutlineSettings,
  MdOutlineLogout,
  MdAccountCircle,
  MdNotifications,
  MdOutlineLightMode,
  MdInbox,
} from 'react-icons/md';
import { HiOutlineTruck } from 'react-icons/hi';

import { CgProfile } from 'react-icons/cg';
import { FaRegComments } from 'react-icons/fa';
import { BiMessageSquareDots } from 'react-icons/bi';
import Link from 'next/link';
import Image from 'next/image';

import logo from '@/images/logo.jpg';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  ChartBarStacked,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Truck,
  UserRoundPen,
  Users,
  Warehouse,
} from 'lucide-react';

interface SideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
}

const SideNavbar = ({ showSidebar, setShowSidebar }: SideNavbarProps) => {
  const pathname = usePathname();
  const basePath = '/wholesaler';

  // Menu items.
  const items = [
    {
      title: 'Dashboard',
      href: `${basePath}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: 'My Orders',
      href: `${basePath}/orders/my-orders`,
      icon: Truck,
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
    {
      title: 'Categories ??',
      href: `${basePath}/categories`,
      icon: ChartBarStacked,
    },
    {
      title: 'Shopping',
      href: `${basePath}/`,
      icon: ShoppingCart,
    },
    {
      title: 'Staff',
      href: `${basePath}/staff`,
      icon: Users,
    },

    {
      title: 'Inbox',
      href: `${basePath}/inbox`,
      icon: Inbox,
    },
    {
      title: 'Account',
      href: `${basePath}/account`,
      icon: UserRoundPen,
    },
  ];
  return (
    <div
      className={`${
        // TODO: add some styling for the sidebar side scroll at some point?
        showSidebar
          ? 'sm:block bg-nezeza_dark_blue space-y-6 w-60 h-screen text-slate-50 fixed left-0 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : ' sm:block bg-nezeza_dark_blue space-y-6 w-16 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll' // add hidden to hide it
      }`}
    >
      <Link className=' px-6 py-2 ' href='#'>
        <Image className='w-36 ' src={logo} alt='logoImg ' />
      </Link>

      <div className='flex flex-col space-y-3 mt-14'>
        {items.map((item) => (
          <Link
            onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
            key={item.title}
            href={item.href}
            className={`${
              item.href == pathname
                ? 'flex items-center space-x-3 px-6 py-2 bg-nezeza_green_600  rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-6 py-2 rounded-md'
            }`}
          >
            <item.icon />
            <span>{item.title}</span>
          </Link>
        ))}
        <div className=' px-6 py-12'>
          <button className='flex items-center space-x-3 px-6 py-2 bg-nezeza_red_600 rounded-md hover:bg-nezeza_green_800'>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
