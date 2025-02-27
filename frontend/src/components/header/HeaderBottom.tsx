import React, { useEffect, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useSelector, useDispatch } from 'react-redux';
import { stateProps } from '../../../type';
import { signOut } from 'next-auth/react';
import { removeUser, removeStore } from '@/redux/nextSlice';
import { useRouter } from 'next/router';
import { LogoutButton } from '../LogoutButton';
import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';
import { GoSidebarCollapse } from 'react-icons/go';
import { getSellerTypeBaseurl } from '@/lib/utils';

interface HeaderBottomProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
}
const HeaderBottom = ({ showSidebar, setShowSidebar }: HeaderBottomProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const dispatch = useDispatch();
  // const [sellerTypeBaseUrl, setSellerTypeBaseUrl] = useState('');

  // useEffect(() => {
  //   if (storeInfo) {
  //     if (storeInfo.storeType === 'manufacturing') {
  //       setSellerTypeBaseUrl('manufacturer');
  //     } else if (storeInfo.storeType === 'wholesale') {
  //       setSellerTypeBaseUrl('wholesaler');
  //     } else if (storeInfo.storeType === 'retail') {
  //       setSellerTypeBaseUrl('retailer');
  //     } else if (storeInfo.storeType === 'admin') {
  //       setSellerTypeBaseUrl('admin');
  //     } else {
  //       setSellerTypeBaseUrl('');
  //     }
  //   } else {
  //     setSellerTypeBaseUrl(''); // Reset to default if storeInfo is null
  //   }
  // }, [storeInfo]);

  return (
    <div className='w-full h-10 bg-nezeza_light_blue text-sm text-black px-4 flex items-center justify-center relative'>
      {/** For controlling the sidebar */}
      {userInfo && !storeInfo && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className='absolute left-0 ml-20'
        >
          <GoSidebarCollapse />
        </button>
      )}

      <p
        className='flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300 '
      >
        <LuMenu />
        All
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Todays Deals
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Food
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Drinks
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Rwandan Products
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Nyirangarama products
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Clasona products
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Customer Service
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        New Releases
      </p>

      {/* <Link
        href='/store-type-choose'
        target='_blank'
        className='flex items-center text-blue-500 hover:underline'
      >
        <SquareArrowOutUpRight className='h-3' />
        Become a Seller
      </Link> */}

      {userInfo && (
        <>
          {' '}
          {/* Conditional rendering for "Become a Seller" */}
          {!storeInfo && (
            <Link
              href='/store-type-choose'
              target='_blank'
              className='flex items-center text-blue-500 hover:underline'
            >
              <SquareArrowOutUpRight className='h-3' />
              Become a Seller
            </Link>
          )}
          {/* Seller Dashboard link */}
          {storeInfo && (
            <Link
              href={`/${getSellerTypeBaseurl()}`}
              target='_blank'
              className='flex items-center text-blue-500 hover:underline'
            >
              <SquareArrowOutUpRight className='h-3' />
              Seller Dashboard
            </Link>
          )}
          {/* <LogoutButton className='ml-2 py-1' /> */}
        </>
      )}
    </div>
  );
};

export default HeaderBottom;
