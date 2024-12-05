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
      icon: MdOutlineSpaceDashboard,
    },
    {
      title: 'My Orders',
      href: `${basePath}/my-orders`,
      icon: HiOutlineTruck,
    },
    {
      title: 'Customer Orders',
      href: `${basePath}/orders`,
      icon: HiOutlineTruck,
    },
    {
      title: 'Inventory',
      href: `${basePath}/inventory`,
      icon: MdInventory,
    },
    {
      title: 'Shopping',
      href: `${basePath}/`,
      icon: MdShoppingCart,
    },

    {
      title: 'Inbox',
      href: `${basePath}/inbox`,
      icon: MdInbox,
    },

    {
      title: 'Settings',
      href: `${basePath}/settings`,
      icon: MdOutlineSettings,
    },
  ];
  return (
    <div
      className={`${
        // TODO: add some styling for the sidebar side scroll at some point?
        showSidebar
          ? 'sm:block bg-nezeza_dark_blue space-y-6 w-60 h-screen text-slate-50 fixed left-0 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : 'hidden sm:block bg-nezeza_dark_blue space-y-6 w-16 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
      }`}
    >
      <Link className=' px-6 py-2 ' href='#'>
        <Image className='w-36 ' src={logo} alt='logoImg ' />
      </Link>

      <div className='flex flex-col space-y-3 mt-14'>
        {items.map((item) => (
          <Link
            onClick={() => setShowSidebar(false)} // collapses side bar when item clicked, might remove
            key={item.title}
            href={item.href}
            className={`${
              item.href == pathname
                ? 'flex items-center space-x-3 px-6 py-2 bg-green-600 rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-6 py-2 rounded-md'
            }`}
          >
            <item.icon />
            <span>{item.title}</span>
          </Link>
        ))}
        <div className=' px-6 py-2'>
          <button className='flex items-center space-x-3 px-6 py-3 bg-green-600 rounded-md'>
            <MdOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* <Disclosure as='nav'>
        <Disclosure.Button className='absolute top-4 right-4 inline-flex items-center peer justify-center rounded-md p-2 text-gray-800 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white group'>
          <GiHamburgerMenu
            className='block md:hidden h-6 w-6'
            aria-hidden='true'
          />
        </Disclosure.Button>
        <div className='p-6 w-1/2 h-screen bg-white z-20 fixed top-0 -left-96 lg:left-0 lg:w-60  peer-focus:left-0 peer:transition ease-out delay-150 duration-200'>
          <div className='flex flex-col justify-start item-center bg-nezeza_light_blue'>
            <h1 className='text-base text-center cursor-pointer font-bold text-blue-900 border-b border-gray-100 pb-4 w-full'>
              Nav Bar
            </h1>
            <div className=' my-4 border-b border-gray-100 pb-4'>
              <Link
                href='/'
                className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'
              >
                <MdOutlineSpaceDashboard className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Dashboard
                </h3>
              </Link>
              <Link
                href='wholesaler/inventory'
                className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'
              >
                <MdInventory className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Inventory
                </h3>
              </Link>
              <Link
                href='wholesaler/my-orders'
                className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'
              >
                <MdShoppingCart className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  My Orders
                </h3>
              </Link>
              <Link
                href='wholesaler/orders'
                className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'
              >
                <MdShoppingCart className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Orders
                </h3>
              </Link>
              <div className='flex  mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'>
                <CgProfile className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Profile
                </h3>
              </div>
              <div className='flex  mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'>
                <MdOutlineAnalytics className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Analytics
                </h3>
              </div>
            </div>
            <div className=' my-4 border-b border-gray-100 pb-4'>
              <div className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'>
                <MdOutlineSettings className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Settings
                </h3>
              </div>
              <div className='flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'>
                <MdOutlineMoreHoriz className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  More
                </h3>
              </div>
            </div>
            <div className=' my-4'>
              <div className='flex mb-2 justify-start items-center gap-4 pl-5 border border-gray-200  hover:bg-gray-900 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto'>
                <MdOutlineLogout className='text-2xl text-gray-600 group-hover:text-white ' />
                <h3 className='text-base text-gray-800 group-hover:text-white font-semibold '>
                  Logout
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Disclosure> */}
    </div>
  );
};

export default SideNavbar;
