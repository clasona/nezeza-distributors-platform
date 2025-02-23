'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/images/logo.jpg';
import { usePathname } from 'next/navigation';
import Button from './FormInputs/Button';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { useRouter } from 'next/router';
import { LogoutButton } from './LogoutButton';
import {
  Bell,
  CircleDollarSign,
  CircleHelp,
  ListOrdered,
  ShoppingCart,
  Truck,
  UserRoundPen,
} from 'lucide-react';

interface CustomerSideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  basePath: string;
}

const CustomerSideNavbar = ({
  showSidebar,
  setShowSidebar,
  basePath,
}: CustomerSideNavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const sidebarLinks = [
    {
      title: 'Shopping',
      href: '/',
      icon: ShoppingCart,
    },
    {
      title: 'Orders',
      href: `${basePath}/orders`,
      icon: ListOrdered,
    },

    {
      title: 'Payments',
      href: `${basePath}/payments`,
      icon: CircleDollarSign,
    },

    {
      title: 'Notifications',
      href: `${basePath}/notifications`,
      icon: Bell,
    },
    {
      title: 'Account',
      href: `${basePath}/my-account`,
      icon: UserRoundPen,
    },
    {
      title: 'Support',
      href: `${basePath}/support`,
      icon: CircleHelp,
    },
  ];

  const handleLogoutClick = () => {
    router.push('/logout'); // Replace '/logout' with your target route
  };

  return (
    <div
      className={`${
        // TODO: add some styling for the sidebar side scroll at some point?
        showSidebar
          ? 'sm:block bg-nezeza_dark_blue space-y-6 w-20 h-screen text-slate-50 fixed left-0 top-16 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : ' sm:block bg-nezeza_dark_blue space-y-6 w-12 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll' // add hidden to hide it
      }`}
    >
      <div className='flex flex-col space-y-2 mt-16'>
        {sidebarLinks.map((item) => (
          <Link
            // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
            key={item.title}
            href={item.href}
            className={`${
              item.href == pathname
                ? 'flex items-center space-x-3 px-4 py-1 bg-nezeza_green_600 rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-4 py-1 rounded-md'
            }`}
          >
            <item.icon />
            {/* <span>{item.title}</span> */}
          </Link>
        ))}

        <div className='flex py-8 px-3'>
          <LogoutButton noLogoutLabel={true}  className='py-2' />
        </div>
      </div>
    </div>
  );
};

export default CustomerSideNavbar;
