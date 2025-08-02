'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createSupportTicket, CreateSupportTicketData } from '@/utils/support/createSupportTicket';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import Button from '@/components/FormInputs/Button';

// Enhanced metadata with ecommerce categories
const fallbackMetadata: SupportMetadata = {
  categories: [
    { value: 'order_issue', label: 'Order Issues' },
    { value: 'payment_problem', label: 'Payment Problems' },
    { value: 'shipping_delay', label: 'Shipping & Delivery' },
    { value: 'product_quality', label: 'Product Quality' },
    { value: 'refund_request', label: 'Returns & Refunds' },
    { value: 'account_access', label: 'Account Issues' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'billing_inquiry', label: 'Billing Questions' },
    { value: 'seller_support', label: 'Seller Support' },
    { value: 'other', label: 'Other' },
  ],
  priorities: [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'medium', label: 'Medium - Standard issue' },
    { value: 'high', label: 'High - Urgent matter' },
    { value: 'urgent', label: 'Urgent - Critical issue' },
  ],
  statuses: [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting_customer', label: 'Waiting for Customer' },
    { value: 'waiting_admin', label: 'Waiting for Admin' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ],
};

// Mock user orders for demonstration
const mockUserOrders = [
  { id: 'VS-2024-001', date: '2024-01-15', status: 'Delivered', total: 'RWF 25,000', items: 'Samsung Galaxy A54, Phone Case' },
  { id: 'VS-2024-002', date: '2024-01-10', status: 'In Transit', total: 'RWF 15,500', items: 'Nike Air Max Shoes' },
  { id: 'VS-2024-003', date: '2024-01-05', status: 'Processing', total: 'RWF 8,750', items: 'Apple AirPods Pro' },
];

// FAQ suggestions based on category
const faqSuggestions = {
  order_issue: [
    'How do I cancel my order?',
    'Why is my order delayed?',
    'Can I change my shipping address?'
  ],
  payment_problem: [
    'My payment was declined, what should I do?',
    'How do I get a receipt for my purchase?',
    'Can I change my payment method?'
  ],
  shipping_delay: [
    'How long does shipping take?',
    'My package is delayed, what happened?',
    'Do you offer express shipping?'
  ],
  product_quality: [
    'My product arrived damaged, what now?',
    'How do I return a defective item?',
    'What is your quality guarantee?'
  ],
};

interface FormData extends CreateSupportTicketData {
  contactPreference: string;
  orderNumber?: string;
  urgencyReason?: string;
}

const CustomerSupportSubmitTicket: React.FC = () => {
  const router = useRouter();
  const [metadata, setMetadata] = useState<SupportMetadata>(fallbackMetadata);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSupportTicketData>({
    defaultValues: {
      subject: '',
      description: '',
      category: '',
      priority: 'medium',
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setMetadataError(null);
      const response = await getSupportMetadata();
      setMetadata(response.metadata);
      // Set default category
      if (response.metadata.categories.length > 0) {
        setValue('category', response.metadata.categories[0].value);
      }
    } catch (error: any) {
      console.error('Failed to fetch metadata:', error);
      setMetadataError(error.message);
      // Use fallback metadata and set default category
      setMetadata(fallbackMetadata);
      setValue('category', fallbackMetadata.categories[0].value);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };

  const onSubmit = async (data: CreateSupportTicketData) => {
    try {
      setLoading(true);
      setError(null);

      const ticketData: CreateSupportTicketData = {
        ...data,
        attachments: selectedFiles,
      };

      const response = await createSupportTicket(ticketData);
      
      // Redirect to the ticket detail page or show success message
      alert(`Support ticket created successfully! Ticket number: ${response.ticket.ticketNumber}`);
      router.push('/customer/support/my-tickets');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
      
      {metadataError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Warning: Using fallback data</p>
          <p className="text-sm">{metadataError}</p>
          <button 
            onClick={fetchMetadata}
            className="text-sm underline hover:no-underline mt-1"
          >
            Retry loading metadata
          </button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            {...register('subject', { required: 'Subject is required' })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your issue"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <DropdownInputSearchable
            name="category"
            label=""
            options={metadata.categories}
            value={selectedCategory ? { value: selectedCategory, label: metadata.categories.find(c => c.value === selectedCategory)?.label || '' } : undefined}
            onChange={(option) => setValue('category', option?.value || '')}
            isRequired={true}
          />
        </div>

        {/* Order Number (if order-related category) */}
        {selectedCategory && ['order_issue', 'payment_problem', 'shipping_delay', 'refund_request'].includes(selectedCategory) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Number (optional)
            </label>
            <input
              type="text"
              {...register('orderId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter order number if applicable"
            />
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <DropdownInputSearchable
            name="priority"
            label=""
            options={metadata.priorities}
            value={{ value: watch('priority') || 'medium', label: metadata.priorities.find(p => p.value === (watch('priority') || 'medium'))?.label || '' }}
            onChange={(option) => setValue('priority', option?.value || 'medium')}
            isRequired={false}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide detailed information about your issue..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (optional)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="text-sm text-gray-500">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            buttonTitle={loading ? 'Submitting...' : 'Submit Ticket'}
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            className="bg-nezeza_blue text-white hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400 px-6 py-2"
=======
            className="bg-nezeza_dark_blue text-white hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400 px-6 py-2"
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2
          />
        </div>
      </form>
    </div>
  );
};

export default CustomerSupportSubmitTicket;
