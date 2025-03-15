import React from 'react'

interface StoreFormHeadingProps{
  heading: string;
  className?: string;
}
const StoreFormHeading = ({ heading, className }: StoreFormHeadingProps) => {
  return (
    <p
      className={`${className} block text-lg text-center font-medium leading-6 text-nezeza_dark_blue col-span-1 sm:col-span-2`}
    >
      {heading}
    </p>
  );
};

export default StoreFormHeading