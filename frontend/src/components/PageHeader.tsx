import { Plus } from 'lucide-react';
import React from 'react';
import Heading from './Heading';
import Link from 'next/link';
import Export from './Table/CustomExport';
import Import from './Table/CustomImport';
import PageHeaderLink from './PageHeaderLink';
import Button from './FormInputs/Button';

interface PageHeaderProps {
  heading: string;
  actions?: React.ReactNode;
  extraComponent?: React.ReactNode;
  className?: string;
}
const PageHeader = ({ heading, actions, extraComponent, className }: PageHeaderProps) => {
  return (
    <div className={`flex justify-between py-4 ${className}`}>
      <div className='flex items-center space-x-3'>
        <Heading title={heading} />
        {actions && <div>{actions}</div>}
      </div>
      {extraComponent && <div>{extraComponent}</div>}
    </div>
  );
};

export default PageHeader;
