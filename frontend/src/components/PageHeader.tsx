import { Plus } from 'lucide-react';
import React from 'react';
import Heading from './Heading';
import Link from 'next/link';
import Export from './Table/Export';
import Import  from './Table/Import';

interface PageHeaderProps {
  heading: string;
  linkTitle: string;
  href: string;
}
const PageHeader = ({ heading, linkTitle, href }: PageHeaderProps) => {
  return (
      <div className='flex justify-between py-4 '>
        <Heading title={heading}></Heading>
        <div className='space-x-3'>
          <Export />
          <Import />
          <Link
            className='text-white bg-green-600 space-x-3 hover:bg-green-600/90 focus:ring-4 focus:outline-none focus:ring-green-600/50 font-medium rounded-lg text-base px-5 py-3 text-center inline-flex items-center dark:focus:ring-green-600/55 me-2 mb-2'
            href={href}
          >
            <Plus />
            <span>{linkTitle}</span>
          </Link>
        </div>
    </div>
  );
};

export default PageHeader;
