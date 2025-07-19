import RootLayout from '@/components/RootLayout';
import PageHeader from '@/components/PageHeader';
import TextInput from '@/components/FormInputs/TextInput';
import Button from '@/components/FormInputs/Button';
import { useState } from 'react';
import { getTicketByNumber } from '@/utils/support/getTicketByNumber';

const LookupTicketPage = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTicket(null);
    try {
      const data = await getTicketByNumber(ticketNumber);
      setTicket(data?.ticket || null);
    } catch (err: any) {
      setError(err?.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <div className='max-w-2xl mx-auto py-8'>
        <PageHeader heading='Lookup Ticket' />
        <form
          className='bg-white rounded-lg shadow-md p-6 space-y-4'
          onSubmit={handleSubmit}
        >
          <TextInput
            label='Ticket Number'
            id='ticketNumber'
            name='ticketNumber'
            value={ticketNumber}
            onChange={(e: any) => setTicketNumber(e.target.value)}
            type='text'
            errors={{}}
            register={() => ({})}
            isRequired={true}
          />
          <Button
            buttonTitle={loading ? 'Searching...' : 'Lookup'}
            disabled={loading}
          />
        </form>
        {error && <div className='text-red-600 mt-2'>{error}</div>}
        {ticket && (
          <div className='bg-white rounded-lg shadow-md p-6 mt-6'>
            <h3 className='font-bold text-vesoko_dark_blue mb-2'>
              Subject: {ticket.subject}
            </h3>
            <p>Status: {ticket.status}</p>
            <p>Category: {ticket.category}</p>
            <p>Priority: {ticket.priority}</p>
            <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
            <div className='mt-4'>
              <h4 className='font-bold mb-2'>Messages</h4>
              {ticket.messages.map((msg: any, idx: number) => (
                <div key={idx} className='mb-2'>
                  <span className='font-semibold'>{msg.senderRole}:</span>{' '}
                  {msg.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

LookupTicketPage.noLayout = true;
export default LookupTicketPage;
