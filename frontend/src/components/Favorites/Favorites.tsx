import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { stateProps } from '../../../type';
import favoritesIcon from '@/images/favorites.png';

interface FavoritesProps {
  productData?: stateProps[];
}
const Favorites = ({ productData }: FavoritesProps) => {
  return (
    <div className='flex items-center justify-center rounded-lg bg-nezeza_dark_blue text-white w-24'>
      <Link
        href={'/favorites'}
        className='flex items-center px-2  border
            border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative'
      >
        <Image
          className='w-auto object-cover h-8'
          src={favoritesIcon}
          alt='favoritesImg'
        />
        <p className='text-xs font-semibold mt-3'>Favorites</p>
        <span className='absolute text-nezeza_yellow text-sm -top-0 left-[29px] font-bold'>
          {productData ? productData.length : 0}
        </span>
      </Link>
    </div>
  );
};

export default Favorites;
