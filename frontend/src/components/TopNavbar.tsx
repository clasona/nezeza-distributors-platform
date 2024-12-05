import React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Disclosure } from '@headlessui/react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MdOutlineSpaceDashboard,
  MdOutlineAnalytics,
  MdInventory,
  MdShoppingCart,
  MdOutlineIntegrationInstructions,
  MdOutlineMoreHoriz,
  MdOutlineSettings,
  MdOutlineDashboard,
  MdOutlineLogout,
  MdAccountCircle,
  MdOutlineNotifications,
  MdOutlineLightMode,
  MdOutlineClose,
  MdMenu,
} from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { GoSidebarCollapse } from 'react-icons/go';

import { FaRegComments } from 'react-icons/fa';
import { BiMessageSquareDots } from 'react-icons/bi';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
// import { SidebarTrigger } from '@/components/ui/sidebar';

interface TopNavbarProps {
  storeName: string;
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
}
 
const TopNavbar = ({
  storeName,
  showSidebar, setShowSidebar
}: TopNavbarProps) => {
  // add fixed to fix top nav bar
  return (
    <div
      className={`${
        showSidebar
          ? 'flex items-center justify-between bg-nezeza_light_blue dark:bg-slate-800 text-nezeza_dark_slate dark:text-nezeza_light_slate ml-60 h-20 px-8 py-4 fixed top-0 w-full z-50 pr-[20rem]'
          : 'flex items-center justify-between bg-nezeza_light_blue dark:bg-slate-800 text-nezeza_dark_slate dark:text-nezeza_light_slate h-20 px-8 py-4 fixed top-0 w-full z-50'
      }`}
    >
      <button onClick={() => setShowSidebar(!showSidebar)}>
        <GoSidebarCollapse />
        {/* <SidebarTrigger /> */}
      </button>
      <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue'>
        {storeName}
      </h2>

      <div className='flex space-x-3'>
        <button>
          {/* <ThemeSwitcher /> */}
          {/* <MdOutlineLightMode className='text-2xl text-nezeza_dark_slate group-hover:text-nezeza_dark_slate '></MdOutlineLightMode> */}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type='button'
              className='relative inline-flex items-center p-3 text-sm font-medium text-center text-nezeza_dark_slate bg-transparent rounded-lg'
            >
              <MdOutlineNotifications className='text-2xl text-nezeza_dark_slate group-hover:text-nezeza_dark_slate '></MdOutlineNotifications>
              <span className='sr-only'>Notifications</span>
              <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2  rounded-full -top-0 end-6 dark:border-gray-900'>
                20
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='px-2 py-4 pr-8'>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <div className='flex items-center space-x-2'>
                <Image
                  src=''
                  alt='User profile'
                  width={200}
                  height={200}
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex flex-col space-y-1'>
                  <p> Banana Stock out</p>
                  <div className='flex items-center space-x-2'>
                    <p className='px-3 py-0.5 bg-red-700 text-nezeza_dark_slate rounded-full text-sm'>
                      {' '}
                      Stock out
                    </p>
                    <p> Dec 12 2024 - 12:50PM</p>
                  </div>
                </div>
                <button>
                  <MdOutlineClose />
                </button>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className='flex items-center space-x-2'>
                <Image
                  src=''
                  alt='User profile'
                  width={200}
                  height={200}
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex flex-col space-y-1'>
                  <p> Banana Stock out</p>
                  <div className='flex items-center space-x-2'>
                    <p className='px-3 py-0.5 bg-red-700 text-nezeza_dark_slate rounded-full text-sm'>
                      {' '}
                      Stock out
                    </p>
                    <p> Dec 12 2024 - 12:50PM</p>
                  </div>
                </div>
                <button>
                  <MdOutlineClose />
                </button>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button>
              {/* <Image src='' alt='User profile' width={200}  height={200} className='w-8 h-8 rounded-full'/> */}
              <MdAccountCircle className='text-2xl text-nezeza_dark_slate group-hover:text-nezeza_dark_slate '></MdAccountCircle>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='px-2 py-4 pr-8'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button className='flex items-center space-x-2'>
                <MdOutlineDashboard className='mr-2 h-4 w-4' />
                <span>Dashboard</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button className='flex items-center space-x-2'>
                <CgProfile />
                <span>Edit Profile</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button className='flex items-center space-x-2'>
                <MdOutlineLogout />
                <span>Logout</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavbar;
