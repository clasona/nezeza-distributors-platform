import React from 'react'

interface StoreFormHeadingProps{
    heading: string;
}
const StoreFormHeading = ({heading}: StoreFormHeadingProps) => {
  return (
    <p className='block text-lg font-medium leading-6 text-nezeza_dark_blue sm:col-span-2'>
      {heading}
    </p>
  );
};

export default StoreFormHeading