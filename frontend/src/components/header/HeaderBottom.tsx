import { getSellerTypeBaseurl } from '@/lib/utils';
import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { LuMenu } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../../type';

interface HeaderBottomProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
}
const HeaderBottom = ({ showSidebar, setShowSidebar }: HeaderBottomProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const dispatch = useDispatch();

  return (
    <div className='w-full h-10 bg-nezeza_light_blue text-sm text-black px-4 flex items-center justify-center relative'>
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
        Customer Service
      </p>
      <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        New Releases
      </p>

      {userInfo && (
        <>
          {' '}
          {/* Conditional rendering for "Become a Seller" */}
          {!storeInfo && (
            <Link
              href='/select-store-type'
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
              className='flex items-center text-blue-500 hover:underline'
            >
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
