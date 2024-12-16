'use client';

import React, { useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Disclosure } from '@headlessui/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  House,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Minus,
  Search,
  ShoppingCart,
  SquareArrowOutUpRight,
  Truck,
  TruckIcon,
  UserRoundPen,
  Users,
  Warehouse,
} from 'lucide-react';

interface SideNavbarProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
}

const SideNavbar = ({ showSidebar, setShowSidebar }: SideNavbarProps) => {
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const pathname = usePathname();
  const basePath = '/wholesaler';
  const sidebarLinks = [
    // {
    //   title: 'Home',
    //   href: `${basePath}/home`,
    //   icon: House,
    // },
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
      title: 'Staff',
      href: `${basePath}/staff`,
      icon: Users,
    },
    {
      title: 'Customers',
      href: `${basePath}/customers`,
      icon: Users,
    },
    {
      title: 'Inbox',
      href: `${basePath}/inbox`,
      icon: Inbox,
    },
    {
      title: 'User Account',
      href: `${basePath}/user-account`,
      icon: UserRoundPen,
    },
    {
      title: 'Store Account',
      href: `${basePath}/store-account`,
      icon: UserRoundPen,
    },
  ];

  const ordersLinks = [
    {
      title: 'My Orders',
      href: `${basePath}/orders/my-orders`,
      icon: Minus,
    },
    {
      title: 'Customer Orders',
      href: `${basePath}/orders/customer-orders`,
      icon: Minus,
    },
  ];

    const shoppingLinks = [
      {
        title: 'Browse',
        href: `${basePath}/shopping/browse`,
        icon: Search,
      },
      {
        title: 'Cart',
        href: `${basePath}/shopping/cart`,
        icon: ShoppingCart,
      },
    ];
  return (
    <div
      className={`${
        // TODO: add some styling for the sidebar side scroll at some point?
        showSidebar
          ? 'sm:block bg-nezeza_dark_blue space-y-6 w-64 h-screen text-slate-50 fixed left-0 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : ' sm:block bg-nezeza_dark_blue space-y-6 w-16 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll' // add hidden to hide it
      }`}
    >
      <Link className=' px-6 py-2 ' href='#'>
        <Image className='w-36 ' src={logo} alt='logoImg ' />
      </Link>
      <div className='flex flex-col space-y-2 mt-14'>
        <Link
          href={`${basePath}/home`}
          className={`${
            pathname == `${basePath}/home`
              ? 'flex items-center space-x-3 px-6 py-1 bg-nezeza_green_600  rounded-md border-l-4 border-white'
              : 'flex items-center space-x-3 px-6 py-1 rounded-md'
          }`}
        >
          <House />
          <span>Home</span>
        </Link>
        <Link
          href={`${basePath}/dashboard`}
          className={`${
            pathname == `${basePath}/dashboard`
              ? 'flex items-center space-x-3 px-6 py-1 bg-nezeza_green_600 rounded-md border-l-4 border-white'
              : 'flex items-center space-x-3 px-6 py-1 rounded-md'
          }`}
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </Link>

        <Collapsible className='px-6 py-1 rounded-md'>
          <CollapsibleTrigger onClick={() => setOpenSubMenu(!openSubMenu)}>
            <button
              // className='flex items-center space-x-6 py-1'
              className={`${
                pathname == `${basePath}/orders/my-orders` || pathname === `${basePath}/orders/customer-orders`
                  ? 'flex items-center space-x-6 px-4 py-1 bg-nezeza_green_600 rounded-md border-l-4 border-white'
                  : 'flex items-center space-x-6 py-1 rounded-md'
              }`}
            >
              <div className='flex items-center space-x-3'>
                <Truck />
                <span>Orders</span>
              </div>
              {openSubMenu ? <ChevronDown /> : <ChevronRight />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className='rounded-lg px-3 pl-4 bg-blue-600'>
            {ordersLinks.map((item) => (
              <Link
                // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
                key={item.title}
                href={item.href}
                className={`${
                  item.href == pathname
                    ? 'flex items-center space-x-3  text-sm py-1 bg-nezeza_green_600 rounded-md border-l-4 border-white'
                    : 'flex items-center space-x-3  text-sm py-1 rounded-md'
                }`}
                // onClick={() => setOpenSubMenu(openSubMenu)}
              >
                <item.icon className='w-4 h-4' />
                <span>{item.title}</span>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {sidebarLinks.map((item) => (
          <Link
            // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
            key={item.title}
            href={item.href}
            className={`${
              item.href == pathname
                ? 'flex items-center space-x-3 px-6 py-1 bg-nezeza_green_600  rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-6 py-1 rounded-md'
            }`}
          >
            <item.icon />
            <span>{item.title}</span>
          </Link>
        ))}
        <Link
          // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
          key={'Shopping'}
          href='/'
          target='_blank'
          className={`${
            pathname == `${basePath}/dashboard`
              ? 'flex items-center space-x-3 px-6 py-1 bg-nezeza_green_600  rounded-md border-l-4 border-white'
              : 'flex items-center space-x-3 px-6 py-1 rounded-md'
          }`}
        >
          <ShoppingCart />
          <span>Shopping</span>
          <SquareArrowOutUpRight className='w-4 h-4' />
        </Link>
        {/* <Collapsible className='px-6 py-1'>
          <CollapsibleTrigger onClick={() => setOpenSubMenu(!openSubMenu)}>
            <button className='flex items-center  space-x-6 py-1 '>
              <div className='flex items-center space-x-3'>
                <ShoppingCart />
                <span>Shopping</span>
              </div>
              {openSubMenu ? <ChevronDown /> : <ChevronRight />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className='rounded-lg px-3 pl-4 bg-blue-600'>
            {shoppingLinks.map((item) => (
              <Link
                // onClick={() => setShowSidebar(true)} // make false: collapses side bar when item clicked, might remove
                key={item.title}
                href={item.href}
                className={`${
                  item.href == pathname
                    ? 'flex items-center space-x-3  text-sm py-1 bg-nezeza_green_600  rounded-md border-l-4 border-white'
                    : 'flex items-center space-x-3  text-sm py-1 rounded-md'
                }`}
                // onClick={() => setOpenSubMenu(openSubMenu)}
              >
                <item.icon className='w-4 h-4' />
                <span>{item.title}</span>
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible> */}
        <div className='flex px-6 py-8'>
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
