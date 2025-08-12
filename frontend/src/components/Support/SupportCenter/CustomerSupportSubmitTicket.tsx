'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createSupportTicket, CreateSupportTicketData } from '@/utils/support/createSupportTicket';
import { getSupportMetadata, SupportMetadata } from '@/utils/support/getSupportMetadata';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import Button from '@/components/FormInputs/Button';
import CloudinaryUploadWidget from '@/components/Cloudinary/UploadWidget';
import AttachmentViewer from '@/components/Support/AttachmentViewer';

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
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
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

  const onSubmit = async (data: CreateSupportTicketData) => {
    try {
      setLoading(true);
      setError(null);

      const ticketData: CreateSupportTicketData = {
        ...data,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : (selectedFiles.length > 0 ? selectedFiles : undefined),
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (optional)
          </label>
          <div className="space-y-3">
            {/* Display uploaded attachments */}
            {attachmentUrls.length > 0 && (
              <div className="space-y-2">
                <AttachmentViewer
                  attachments={attachmentUrls}
                  title={`Uploaded Attachments (${attachmentUrls.length}/5)`}
                  maxDisplay={5}
                />
                <div className="flex flex-wrap gap-2">
                  {attachmentUrls.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAttachmentUrls(prev => prev.filter((_, i) => i !== index))}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                      title="Remove attachment"
                    >
                      Remove {url.split('/').pop()?.split('.')[0] || `File ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload widget */}
            {attachmentUrls.length < 5 && (
              <CloudinaryUploadWidget
                onUpload={(urls) => setAttachmentUrls((prev) => [...prev, ...urls])}
                maxFiles={5 - attachmentUrls.length}
                folder="support-tickets"
                buttonText={`Upload Files (${attachmentUrls.length}/5)`}
                className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-4 px-6 text-center hover:bg-gray-100 hover:border-vesoko_dark_blue transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Click to Upload Files ({attachmentUrls.length}/5)
                  </span>
                </div>
              </CloudinaryUploadWidget>
            )}
            
            <div className="text-xs text-gray-500">
              <p>• Supported formats: Images, PDF, DOC, DOCX, TXT, ZIP, XLS, XLSX</p>
              <p>• Maximum file size: 10MB per file</p>
              <p>• Maximum 5 files allowed</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            buttonTitle={loading ? 'Submitting...' : 'Submit Ticket'}
            type="submit"
            disabled={loading}
            className="bg-nezeza_dark_blue text-white hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400 disabled:cursor-not-allowed px-6 py-2 transition-colors duration-200"
          />
        </div>
      </form>
    </div>
  );
};

export default CustomerSupportSubmitTicket;
