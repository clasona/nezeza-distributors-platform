import RootLayout from '@/components/RootLayout';
import PageHeader from '@/components/PageHeader';
import TextInput from '@/components/FormInputs/TextInput';
import TextAreaInput from '@/components/FormInputs/TextAreaInput';
import Button from '@/components/FormInputs/Button';
import { useState, useEffect } from 'react';
import { createSupportTicket } from '@/utils/support/createSupportTicket';
import { getSupportMetadata } from '@/utils/support/getSupportMetadata';

const NewTicketPage = () => {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [metadata, setMetadata] = useState({ categories: [], priorities: [] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSupportMetadata().then((data) => {
      setMetadata({
        categories: data?.categories || [],
        priorities: data?.priorities || [],
      });
    });
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createSupportTicket(form);
      setSuccess('Ticket created successfully!');
      setForm({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <div className='max-w-2xl mx-auto py-8'>
        <PageHeader heading='Create Support Ticket' />
        <form
          className='bg-white rounded-lg shadow-md p-6 space-y-4'
          onSubmit={handleSubmit}
        >
          <TextInput
            label='Subject'
            id='subject'
            name='subject'
            value={form.subject}
            onChange={handleChange}
            type='text'
            errors={{}}
            register={() => ({})}
            isRequired={true}
          />
          <TextAreaInput
            label='Description'
            id='description'
            name='description'
            defaultValue={form.description}
            onChange={handleChange}
            errors={{}}
            register={() => ({})}
            isRequired={true}
          />
          <div>
            <label className='block font-bold mb-1'>Category</label>
            <select
              name='category'
              value={form.category}
              onChange={handleChange}
              className='w-full border rounded p-2'
              required
            >
              <option value=''>Select category</option>
              {metadata.categories.map((cat: any) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block font-bold mb-1'>Priority</label>
            <select
              name='priority'
              value={form.priority}
              onChange={handleChange}
              className='w-full border rounded p-2'
            >
              {metadata.priorities.map((pri: any) => (
                <option key={pri.value} value={pri.value}>
                  {pri.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            buttonTitle={loading ? 'Submitting...' : 'Submit'}
            disabled={loading}
          />
          {success && <div className='text-green-600 mt-2'>{success}</div>}
          {error && <div className='text-red-600 mt-2'>{error}</div>}
        </form>
      </div>
    </RootLayout>
  );
};

NewTicketPage.noLayout = true;
export default NewTicketPage;
