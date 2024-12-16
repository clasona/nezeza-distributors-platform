import { Plus } from 'lucide-react';
import React from 'react';
import Heading from './Heading';
import Link from 'next/link';
import Export from './Table/CustomExport';
import Import from './Table/CustomImport';

interface PageHeaderLinkProps {
  linkTitle?: string;
  href: string;
}
const PageHeaderLink = ({ linkTitle, href }: PageHeaderLinkProps) => {
  return (
      <div className='space-x-3'>
        <Export />
        <Import />
        <Link
          className='text-white bg-nezeza_green_600  space-x-3 hover:bg-nezeza_green_800 /90 focus:ring-4 focus:outline-none focus:ring-nezeza_green_600 /50 font-medium rounded-lg text-base px-5 py-2 text-center inline-flex items-center dark:focus:ring-nezeza_green_600 /55 me-2 mb-2'
          href={href}
        >
          <Plus />
          <span>{linkTitle}</span>
        </Link>
    </div>
  );
};

export default PageHeaderLink;
