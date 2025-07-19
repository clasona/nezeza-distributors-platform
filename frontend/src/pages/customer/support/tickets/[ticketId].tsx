import RootLayout from '@/components/RootLayout';
import PageHeader from '@/components/PageHeader';
import FormInput from '@/components/FormInputs/FormInput';
import Button from '@/components/FormInputs/Button';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSingleTicket } from '@/utils/support/getSingleTicket';
import { addMessageToTicket } from '@/utils/support/addMessageToTicket';

const TicketDetailsPage = () => {
  const router = useRouter();
  const { ticketId } = router.query;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticketId) {
      setLoading(true);
      getSingleTicket(ticketId as string)
        .then((data) => setTicket(data?.ticket || null))
        .catch(() => setTicket(null))
        .finally(() => setLoading(false));
    }
  }, [ticketId]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      await addMessageToTicket(ticketId as string, message);
      setMessage('');
      // Refresh ticket
      const data = await getSingleTicket(ticketId as string);
      setTicket(data?.ticket || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <RootLayout>
      <div className='max-w-2xl mx-auto py-8'>
        <PageHeader heading='Ticket Details' />
        {loading ? (
          <div className='text-center py-8'>Loading ticket...</div>
        ) : !ticket ? (
          <div className='text-center py-8'>Ticket not found.</div>
        ) : (
          <div className='bg-white rounded-lg shadow-md p-6'>
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
            <form className='mt-6 space-y-2' onSubmit={handleSendMessage}>
              <FormInput
                label='Add Message'
                name='message'
                value={message}
                onChange={(e: any) => setMessage(e.target.value)}
                textarea
                required
              />
              <Button
                buttonTitle={sending ? 'Sending...' : 'Send Message'}
                disabled={sending}
              />
              {error && <div className='text-red-600 mt-2'>{error}</div>}
            </form>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

TicketDetailsPage.noLayout = true;
export default TicketDetailsPage;
