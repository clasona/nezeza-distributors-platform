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
  MdMenu
} from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FaRegComments } from 'react-icons/fa';
import { BiMessageSquareDots } from 'react-icons/bi';
import Link from 'next/link';

interface StoreNameProps {
  storeName: string;
}

const TopNavbar = ({ storeName }: StoreNameProps) => {
  return (
    <div className='flex items-center justify-between bg-slate-800 text-slate-50 ml-60 h-16 px-8 py-4 fixed'>
      <button>
        <MdMenu />
      </button>
      <h2 className='text-3xl font-bold text-center mb-4 text-nezeza_dark_blue'>
        {storeName}
      </h2>

      <div className='flex space-x-3'>
        <MdOutlineLightMode className='text-2xl text-gray-600 group-hover:text-white '></MdOutlineLightMode>
        <MdNotifications className='text-2xl text-gray-600 group-hover:text-white '></MdNotifications>
        <MdAccountCircle className='text-2xl text-gray-600 group-hover:text-white '></MdAccountCircle>
      </div>
    </div>
  );
};

export default TopNavbar;
