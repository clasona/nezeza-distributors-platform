import PageHeader from '../PageHeader';
import Link from 'next/link';

const UserSupport = () => {
  return (
    <div>
      <PageHeader heading='Customer Support' />
      <div className='mb-6 text-lg text-vesoko_dark_blue'>
        Welcome to VeSoko Support. How can we help you today?
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Link href='/customer/support/tickets'>
          <div className='bg-white rounded-lg shadow-md p-6 hover:bg-vesoko_light_blue cursor-pointer transition'>
            <h3 className='font-bold text-vesoko_dark_blue mb-2'>My Tickets</h3>
            <p>View, create, and manage your support tickets.</p>
          </div>
        </Link>
        <Link href='/customer/support/faqs'>
          <div className='bg-white rounded-lg shadow-md p-6 hover:bg-vesoko_light_blue cursor-pointer transition'>
            <h3 className='font-bold text-vesoko_dark_blue mb-2'>FAQs</h3>
            <p>Find answers to common questions.</p>
          </div>
        </Link>
        <Link href='/customer/support/new'>
          <div className='bg-white rounded-lg shadow-md p-6 hover:bg-vesoko_light_blue cursor-pointer transition'>
            <h3 className='font-bold text-vesoko_dark_blue mb-2'>
              Create Ticket
            </h3>
            <p>Submit a new support request.</p>
          </div>
        </Link>
        <Link href='/customer/support/lookup'>
          <div className='bg-white rounded-lg shadow-md p-6 hover:bg-vesoko_light_blue cursor-pointer transition'>
            <h3 className='font-bold text-vesoko_dark_blue mb-2'>
              Lookup Ticket
            </h3>
            <p>Find a ticket by its number.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UserSupport;
