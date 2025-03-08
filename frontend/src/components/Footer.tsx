import React from 'react';
import logo from '../images/logo.jpg';
import Image from 'next/image';

const Footer = () => {
  return (
    <div className='w-full h-20 bg-nezeza_light_blue text-black-400 flex items-center justify-center gap-4'>
      <Image className='w-24' src={logo} alt='Logo' />
      <p className='text-sm '>
        © {new Date().getFullYear()} Developed by{' '}
        <a
          className='text-nezeza_dark_blue hover:text-nezeza_green_600 hoverunderline decoration-[1px]
            cursor-pointer duration-250'
          href='https://www.clasona.com/'
          target='_blank'
        >
          Clasona Ltd.{' '}
        </a>
        All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
