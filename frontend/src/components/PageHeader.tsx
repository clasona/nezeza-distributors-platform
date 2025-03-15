import React from 'react';
import Heading from './Heading';

interface PageHeaderProps {
  heading: string;
  actions?: React.ReactNode;
  extraComponent?: React.ReactNode;
  className?: string;
}
const PageHeader = ({ heading, actions, extraComponent, className }: PageHeaderProps) => {
  return (
    <div className={`flex justify-between py-2 sm:py-4 mb-4 ${className}`}>
      <div className='flex items-center space-x-2 sm:space-x-3'>
        <Heading title={heading} />
        {actions && <div>{actions}</div>}
      </div>
      {extraComponent && <div>{extraComponent}</div>}
    </div>
  );
};

export default PageHeader;
