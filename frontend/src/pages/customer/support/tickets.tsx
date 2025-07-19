import RootLayout from '@/components/RootLayout';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/FormInputs/Button';
import { useEffect, useState } from 'react';
import { getMySupportTickets } from '@/utils/support/getMySupportTickets';
import Link from 'next/link';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const data = await getMySupportTickets();
        setTickets(data?.tickets || []);
      } catch (error) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Sample tickets for demo
  const sampleTickets = [
    {
      _id: 'demo1',
      subject: 'Order not delivered',
      status: 'open',
      category: 'order_issue',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'demo2',
      subject: 'Refund request for damaged item',
      status: 'in_progress',
      category: 'refund_request',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'demo3',
      subject: 'Unable to login to my account',
      status: 'resolved',
      category: 'account_access',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  return (
    <RootLayout>
      <div className='max-w-3xl mx-auto py-8'>
        <PageHeader
          heading='My Support Tickets'
          actions={
            <Link href='/customer/support/new'>
              <Button buttonTitle='Create New Ticket' />
            </Link>
          }
        />
        {loading ? (
          <div className='text-center py-8'>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <>
            <div className='text-center py-8'>No tickets found. Here are some sample tickets:</div>
            <div className='space-y-4'>
              {sampleTickets.map((ticket: any) => (
                <div key={ticket._id} className='bg-white rounded-lg shadow-md p-6 opacity-70'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-bold text-vesoko_dark_blue mb-2'>{ticket.subject}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'open'
                          ? 'bg-vesoko_green_100 text-vesoko_green_700'
                          : ticket.status === 'in_progress'
                          ? 'bg-vesoko_blue_100 text-vesoko_dark_blue'
                          : 'bg-vesoko_gray_200 text-vesoko_gray_700'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className='text-sm text-vesoko_gray_700'>{ticket.category}</p>
                  <p className='text-xs text-vesoko_gray_500'>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='space-y-4'>
            {tickets.map((ticket: any) => (
              <Link
                key={ticket._id}
                href={`/customer/support/tickets/${ticket._id}`}
              >
                <div className='bg-white rounded-lg shadow-md p-6 hover:bg-vesoko_light_blue cursor-pointer'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-bold text-vesoko_dark_blue mb-2'>
                      {ticket.subject}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'open'
                          ? 'bg-vesoko_green_100 text-vesoko_green_700'
                          : 'bg-vesoko_gray_200 text-vesoko_gray_700'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className='text-sm text-vesoko_gray_700'>
                    {ticket.category}
                  </p>
                  <p className='text-xs text-vesoko_gray_500'>
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RootLayout>
  );
};

TicketsPage.noLayout = true;
export default TicketsPage;
