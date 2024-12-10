import React from 'react';
import { LuMenu } from 'react-icons/lu';
import { useSelector, useDispatch } from 'react-redux';
import { stateProps } from '../../../type';
import { signOut } from 'next-auth/react';
import { removeUser } from '@/store/nextSlice';

const HeaderBottom = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);
  const dispatch = useDispatch();
  const handleSignOut = () => {
    signOut();
    dispatch(removeUser());
  };

  return (
    <div className='w-full h-10 bg-nezeza_light_blue text-sm text-black px-4 flex items-center justify-center'>
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
      {/* <p
        className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-white cursor-pointer duration-300'
      >
        Signout
      </p> */}

      {userInfo && (
        <button
          onClick={handleSignOut}
          className='hidden md:inline-flex flex items-center gap-1 h-8 px-2 border border-transparent
        hover:border-red-600 hover:text-nezeza_red_600 text-nezeza_red_600 cursor-pointer duration-300'
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

export default HeaderBottom;
