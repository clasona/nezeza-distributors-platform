import { Plus } from 'lucide-react';
import Link from 'next/link';
import Export from './Table/CustomExport';
import Import from './Table/CustomImport';

interface PageHeaderLinkProps {
  linkTitle?: string;
  href: string;
}
const PageHeaderLink = ({ linkTitle, href }: PageHeaderLinkProps) => {
  return (
    // <div className='space-x-2 sm:space-x-3'>
    <div className='flex flex-wrap gap-2 sm:gap-3'>
      {/* <Export />
      <Import /> */}
      <Link
        className='text-white bg-vesoko_primary flex items-center gap-2 sm:gap-3 hover:bg-vesoko_secondary/90 focus:ring-4 focus:outline-none focus:ring-vesoko_primary/50 font-medium rounded-lg text-sm px-2 sm:px-4 py-1 sm:py-2 text-center dark:focus:ring-vesoko_primary/55'
        // className='text-white bg-vesoko_primary space-x-2 sm:space-x-3 hover:bg-vesoko_secondary /90 focus:ring-4 focus:outline-none focus:ring-vesoko_primary /50 font-medium rounded-lg text-base px-5 py-2 text-center inline-flex items-center dark:focus:ring-vesoko_primary /55 me-2 mb-2'
        href={href}
      >
        <Plus className='w-4 h-4' />
        <span>{linkTitle}</span>
      </Link>
    </div>
  );
};

export default PageHeaderLink;
