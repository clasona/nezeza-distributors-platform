'use client';

import logo from '@/images/logo.jpg';
import {
  Book,
  CircleDollarSign,
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Store,
  Truck,
  UserRoundPen,
  UsersRound
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '../LogoutButton';

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
  const pathname = usePathname();
 
  const sidebarLinks = [
    {
      title: 'Dashboard ',
      href: `${basePath}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: 'Store Applications',
      href: `${basePath}/store-applications`,
      icon: Book,
    },
    {
      title: 'Users',
      href: `${basePath}/users`,
      icon: UsersRound,
    },
    {
      title: 'Stores',
      href: `${basePath}/stores`,
      icon: Store,
    },
    {
      title: 'Products',
      href: `${basePath}/products`,
      icon: ShoppingCart,
    },
    {
      title: 'Orders',
      href: `${basePath}/orders`,
      icon: Truck,
    },
    {
      title: 'Payments',
      href: `${basePath}/payments`,
      icon: CircleDollarSign,
    },
    {
      title: 'Support',
      href: `${basePath}/support`,
      icon: MessageSquare,
    },
    {
      title: 'My Account',
      href: `${basePath}/my-account`,
      icon: UserRoundPen,
    },
    // {
    //   title: 'Shopping',
    //   href: '/',
    //   icon: ShoppingCart,
    //   extraIcon: SquareArrowOutUpRight,
    //   target: '_blank',
    // },
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
        {sidebarLinks.map((item) => (
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
          <LogoutButton className='py-2' redirectTo='login' />
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
