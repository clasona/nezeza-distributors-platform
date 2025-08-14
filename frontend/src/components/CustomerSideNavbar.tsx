'use client';

import {
  Bell,
  CircleDollarSign,
  CircleHelp,
  ListOrdered,
  ShoppingCart,
  UserRoundPen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { LogoutButton } from './LogoutButton';

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
          ? 'sm:block bg-vesoko_primary space-y-6 w-20 h-screen text-slate-50 fixed left-0 top-16 shadow-md mt-20 sm:mt-0 overflow-y-scroll'
          : ' sm:block bg-vesoko_primary space-y-6 w-12 h-screen text-slate-50 fixed -left-60 top-0 shadow-md mt-20 sm:mt-0 overflow-y-scroll' // add hidden to hide it
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
                ? 'flex items-center space-x-3 px-4 py-1 bg-vesoko_primary rounded-md border-l-4 border-white'
                : 'flex items-center space-x-3 px-4 py-1 rounded-md'
            }`}
          >
            <item.icon />
            {/* <span>{item.title}</span> */}
          </Link>
        ))}

        <div className='flex py-8 px-3'>
          <LogoutButton noLogoutLabel={true} className='py-2' />
        </div>
      </div>
    </div>
  );
};

export default CustomerSideNavbar;
