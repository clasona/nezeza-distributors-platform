import React from 'react';
import logo from '../images/main.png'; // Same logo as header
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = 'VeSoko';

  return (
    <footer className='w-full bg-vesoko_light_blue text-black border-t border-gray-200 mt-auto'>
      <div className='w-full py-6 px-4'>
        <div className='max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          {/* Logo */}
          <div className='flex items-center justify-center'>
            <Image 
              className='w-20 h-12 sm:w-24 sm:h-14 object-contain' 
              src={logo} 
              alt='VeSoko Logo' 
              width={96}
              height={56}
              priority
            />
          </div>
          
          {/* Copyright Text */}
          <div className='text-center sm:text-right'>
            <p className='text-sm text-gray-700'>
              © {currentYear} {companyName}. All rights reserved.
            </p>
            <p className='text-xs text-gray-600 mt-1'>
              Developed by{' '}
              <a
                className='text-vesoko_dark_blue hover:text-vesoko_green_600 hover:underline transition-colors duration-200'
                href='https://www.clasona.com/'
                target='_blank'
                rel='noopener noreferrer'
              >
                Clasona Ltd.
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
