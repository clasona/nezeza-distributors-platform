'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import { getUserTickets } from '@/utils/support/getUserTickets';
import { addMessageToTicket } from '@/utils/support/addMessageToTicket';
import { getTicketDetails } from '@/utils/support/getTicketDetails';
import AttachmentViewer from '@/components/Support/AttachmentViewer';
import CloudinaryUploadWidget from '@/components/Cloudinary/UploadWidget';

// Fallback ticket data for offline/error scenarios
const fallbackTickets: SupportTicket[] = [
  {
    _id: '1',
    ticketNumber: 'VS-2024-001',
    subject: 'Order not delivered yet',
    category: 'shipping_delay',
    priority: 'high',
    status: 'in_progress',
    description: 'My order was supposed to arrive yesterday but I haven\'t received it yet.',
    userId: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userRole: 'customer',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-21T14:20:00Z',
    orderId: { _id: 'VS-ORD-2024-123', totalAmount: 0, paymentStatus: '', fulfillmentStatus: '', createdAt: '2024-01-20T10:30:00Z' },
    messages: [
      {
        _id: '1',
        senderId: { _id: 'user1', firstName: 'You', lastName: '' },
        senderRole: 'customer',
        message: 'My order was supposed to arrive yesterday but I haven\'t received it yet. Can you please check the status?',
        attachments: [],
        isInternal: false,
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        _id: '2',
        senderId: { _id: 'admin1', firstName: 'Sarah', lastName: 'Support' },
        senderRole: 'admin',
        message: 'Hi! I\'m sorry to hear about the delay. I\'ve checked with our shipping partner and your package is currently at the local distribution center. It should be delivered today before 6 PM. I\'ll send you the tracking details.',
        attachments: [],
        isInternal: false,
        createdAt: '2024-01-20T15:45:00Z'
      },
      {
        _id: '3',
        senderId: { _id: 'admin1', firstName: 'Sarah', lastName: 'Support' },
        senderRole: 'admin',
        message: 'Here\'s your tracking number: TRK123456789. You can also track it on our website.',
        attachments: [{ filename: 'tracking_details.pdf', url: '#', fileType: 'pdf', fileSize: 1024 }],
        isInternal: false,
        createdAt: '2024-01-20T15:47:00Z'
      }
    ],
    attachments: []
  },
  {
    _id: '2',
    ticketNumber: 'VS-2024-002',
    subject: 'Product quality issue',
    category: 'product_quality',
    priority: 'medium',
    status: 'resolved',
    description: 'The phone case I ordered has a scratch on the back.',
    userId: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userRole: 'customer',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    orderId: { _id: 'VS-ORD-2024-098', totalAmount: 0, paymentStatus: '', fulfillmentStatus: '', createdAt: '2024-01-18T09:15:00Z' },
    messages: [
      {
        _id: '1',
        senderId: { _id: 'user1', firstName: 'You', lastName: '' },
        senderRole: 'customer',
        message: 'The phone case I ordered has a scratch on the back. It looks like it was damaged during shipping.',
        attachments: [{ filename: 'case_damage.jpg', url: '#', fileType: 'jpg', fileSize: 2048000 }],
        isInternal: false,
        createdAt: '2024-01-18T09:15:00Z'
      },
      {
        _id: '2',
        senderId: { _id: 'admin1', firstName: 'Mike', lastName: 'Quality Team' },
        senderRole: 'admin',
        message: 'Thank you for reporting this issue. I can see from the photo that the case is indeed damaged. We\'ll send you a replacement immediately at no extra cost. You should receive it within 2-3 business days.',
        attachments: [],
        isInternal: false,
        createdAt: '2024-01-18T14:20:00Z'
      },
      {
        _id: '3',
        senderId: { _id: 'user1', firstName: 'You', lastName: '' },
        senderRole: 'customer',
        message: 'Thank you! I received the replacement and it\'s perfect. Great customer service!',
        attachments: [],
        isInternal: false,
        createdAt: '2024-01-19T16:30:00Z'
      }
    ],
    attachments: []
  },
  {
    _id: '3',
    ticketNumber: 'VS-2024-003',
    subject: 'Payment failed but amount deducted',
    category: 'payment_problem',
    priority: 'urgent',
    status: 'open',
    description: 'My payment failed during checkout but the amount was deducted from my account.',
    userId: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userRole: 'customer',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    orderId: undefined,
    messages: [
      {
        _id: '1',
        senderId: { _id: 'user1', firstName: 'You', lastName: '' },
        senderRole: 'customer',
        message: 'My payment failed during checkout but the amount was deducted from my account. Please help me resolve this issue.',
        attachments: [{ filename: 'bank_statement.pdf', url: '#', fileType: 'pdf', fileSize: 1024000 }],
        isInternal: false,
        createdAt: '2024-01-22T11:00:00Z'
      }
    ],
    attachments: []
  }
];

// Real backend message structure
interface BackendMessage {
  _id: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  senderRole: string;
  message: string;
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

// Frontend display structure (converted from backend)
interface TicketMessage {
  id: string;
  author: 'customer' | 'admin';
  authorName: string;
  content: string;
  timestamp: string;
  attachments: { name: string; url: string }[];
}

interface ExtendedSupportTicket extends Omit<SupportTicket, 'messages'> {
  messages?: TicketMessage[];
}

const CustomerSupportMyTickets: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<ExtendedSupportTicket | null>(null);
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [replyAttachmentUrls, setReplyAttachmentUrls] = useState<string[]>([]);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend message format to frontend format
  const convertBackendMessages = (backendMessages: any[]): TicketMessage[] => {
    if (!backendMessages || !Array.isArray(backendMessages)) {
      return [];
    }
    
    return backendMessages.map((msg: any) => ({
      id: msg._id || msg.id || Date.now().toString(),
      author: msg.senderRole === 'customer' ? 'customer' : 'admin',
      authorName: msg.senderRole === 'customer' 
        ? 'You' 
        : `${msg.senderId?.firstName || 'Support'} ${msg.senderId?.lastName || 'Team'}`.trim(),
      content: msg.message || msg.content || '',
      timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      attachments: (msg.attachments || []).map((att: any) => {
        // Handle both URL strings and attachment objects
        if (typeof att === 'string') {
          // If it's a URL string, extract filename from URL
          const filename = att.split('/').pop() || 'attachment';
          return {
            name: filename,
            url: att
          };
        }
        // Handle attachment objects (legacy format)
        return {
          name: att.filename || att.name || 'Unknown file',
          url: att.url || '#'
        };
      })
    }));
  };

  // Convert backend ticket format to frontend format
  const convertBackendTicket = (backendTicket: any): ExtendedSupportTicket => {
    return {
      ...backendTicket,
      messages: convertBackendMessages(backendTicket.messages),
      // Ensure we have valid dates
      createdAt: backendTicket.createdAt || new Date().toISOString(),
      updatedAt: backendTicket.updatedAt || backendTicket.createdAt || new Date().toISOString(),
    };
  };

  // Load tickets from backend on component mount
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading user tickets from backend...');
        
        const response = await getUserTickets();
        console.log('Raw backend response:', response);
        
        if (response.tickets && Array.isArray(response.tickets)) {
          const convertedTickets = response.tickets.map(convertBackendTicket);
          console.log('Converted tickets:', convertedTickets);
          setTickets(convertedTickets);
        } else {
          console.warn('Invalid tickets format from backend:', response);
          setTickets([]);
        }
      } catch (error: any) {
        console.error('Failed to load tickets:', error);
        setError(error.message);
        // Use fallback data on error - convert to ExtendedSupportTicket format
        const convertedFallbackTickets = fallbackTickets.map(convertBackendTicket);
        setTickets(convertedFallbackTickets);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order_issue': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>;
      case 'payment_problem': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>;
      case 'shipping_delay': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'product_quality': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>;
      case 'refund_request': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>;
      case 'account_access': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>;
      case 'technical_support': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>;
      case 'billing_inquiry': 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>;
      default: 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || ticket.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const handleTicketSelect = (ticket: ExtendedSupportTicket) => {
    setSelectedTicket(ticket);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setNewMessage('');
    setSelectedFiles([]);
    setReplyAttachmentUrls([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  // Helper function to validate Cloudinary URLs
  const validateCloudinaryUrls = (urls: string[]) => {
    return urls.filter(url => 
      typeof url === 'string' && 
      url.length > 0 && 
      url.includes('res.cloudinary.com')
    );
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmittingMessage(true);
    
    try {
      console.log('Sending message to ticket:', selectedTicket._id);
      
      // Validate and send Cloudinary URLs directly as array of strings
      const validatedUrls = validateCloudinaryUrls(replyAttachmentUrls);
      
      console.log('Sending attachments:', validatedUrls);
      
      // Real API call to add message with Cloudinary URLs
      const response = await addMessageToTicket(selectedTicket._id, {
        message: newMessage,
        attachments: validatedUrls // Send URLs directly as array of strings
      });
      
      console.log('Message sent successfully:', response);
      
      // Refresh ticket details to get updated messages
      const updatedTicketResponse = await getTicketDetails(selectedTicket._id);
      const rawUpdatedTicket = updatedTicketResponse.ticket;
      
      // Convert backend response to frontend format
      const updatedTicket = convertBackendTicket(rawUpdatedTicket);
      
      // Update the selected ticket and tickets list
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t._id === selectedTicket._id ? updatedTicket : t));
      
      // Clear form
      setNewMessage('');
      setSelectedFiles([]);
      setReplyAttachmentUrls([]);
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedTicket) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tickets
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
              <p className="text-gray-600">Ticket #{selectedTicket.ticketNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
              {selectedTicket.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
              {selectedTicket.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="bg-white rounded-lg shadow-sm border p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <span className="text-xs font-medium text-gray-500">Category</span>
              <p className="flex items-center mt-0.5 text-sm">
                <span className="mr-1">{getCategoryIcon(selectedTicket.category || 'other')}</span>
                {(selectedTicket.category || 'other').replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Created</span>
              <p className="mt-0.5 text-sm">{formatDate(selectedTicket.createdAt)}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Last Updated</span>
              <p className="mt-0.5 text-sm">{formatDate(selectedTicket.updatedAt || selectedTicket.createdAt)}</p>
            </div>
            {selectedTicket.orderId && (
              <div>
                <span className="text-xs font-medium text-gray-500">Related Order</span>
                <p className="mt-0.5 text-sm text-blue-600 font-medium">{selectedTicket.orderId?._id || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Initial Description */}
        <div className="bg-white rounded-lg shadow-sm border mb-4">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Original Description</h3>
          </div>
          <div className="p-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.description}</p>
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mt-3">
                  <AttachmentViewer 
                    attachments={selectedTicket.attachments}
                    title="Initial Attachments"
                    maxDisplay={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm border mb-4">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Conversation</h3>
            {selectedTicket.messages && selectedTicket.messages.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No replies yet</p>
            )}
          </div>
          {selectedTicket.messages && selectedTicket.messages.length > 0 && (
            <div className="p-4 space-y-4">
            {selectedTicket.messages?.map((message) => (
              <div key={message.id} className={`flex ${message.author === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl ${
                  message.author === 'customer' 
                    ? 'bg-nezeza_dark_blue text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{message.authorName}</span>
                    <span className={`text-xs ${
                      message.author === 'customer' ? 'text-nezeza_light_blue' : 'text-gray-500'
                    }`}>
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <AttachmentViewer 
                        attachments={message.attachments.map(att => ({ url: att.url, filename: att.name }))}
                        title="Message Attachments"
                        maxDisplay={2}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Reply Form */}
        {selectedTicket.status !== 'closed' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Add a Reply</h4>
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (optional)
                </label>
                <div className="space-y-3">
                  {/* Debug info for reply attachments */}
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Debug: replyAttachmentUrls.length = {replyAttachmentUrls.length}
                    {replyAttachmentUrls.length > 0 && (
                      <div className="mt-1">
                        URLs: {JSON.stringify(replyAttachmentUrls, null, 2)}
                      </div>
                    )}
                  </div>
                  
                  {/* Display uploaded Cloudinary attachments */}
                  {replyAttachmentUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Reply Attachments ({replyAttachmentUrls.length}/3):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {replyAttachmentUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                              {(() => {
                                if (!url || typeof url !== 'string') {
                                  return (
                                    <div className="text-xs text-gray-500 text-center px-1">
                                      INVALID
                                    </div>
                                  );
                                }
                                
                                // Enhanced file type detection for Cloudinary URLs
                                const getFileTypeFromUrl = (urlString: string) => {
                                  // Check for format parameter in Cloudinary URLs (e.g., f_auto,q_auto)
                                  const formatMatch = urlString.match(/f_([^,]+)/);
                                  if (formatMatch) {
                                    return formatMatch[1].toUpperCase();
                                  }
                                  
                                  // Check for resource_type in Cloudinary URLs
                                  if (urlString.includes('/image/')) {
                                    return 'IMAGE';
                                  }
                                  if (urlString.includes('/raw/')) {
                                    return 'FILE';
                                  }
                                  if (urlString.includes('/video/')) {
                                    return 'VIDEO';
                                  }
                                  
                                  // Fallback to file extension
                                  const extension = urlString.split('.').pop()?.toLowerCase();
                                  if (extension) {
                                    return extension.toUpperCase();
                                  }
                                  
                                  return 'FILE';
                                };
                                
                                const fileType = getFileTypeFromUrl(url);
                                
                                // Check if it's likely an image (either by extension or Cloudinary indicators)
                                const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                                               url.includes('/image/') ||
                                               ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(fileType);
                                
                                if (isImage) {
                                  return (
                                    <img
                                      src={url}
                                      alt={`Reply Attachment ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Fallback to file icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = document.createElement('div');
                                        fallback.className = 'text-xs text-gray-500 text-center px-1';
                                        fallback.textContent = fileType;
                                        target.parentNode?.appendChild(fallback);
                                      }}
                                    />
                                  );
                                } else {
                                  // Show file type for non-images
                                  return (
                                    <div className="text-xs text-gray-500 text-center px-1 flex flex-col items-center">
                                      {/* File icon */}
                                      <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="text-xs">{fileType}</span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                            <button
                              type="button"
                              onClick={() => setReplyAttachmentUrls(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              title="Remove attachment"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload widget */}
                  {replyAttachmentUrls.length < 3 && (
                    <CloudinaryUploadWidget
                      onUpload={(files) => {
                        console.log('Reply upload - files received:', files);
                        const newUrls = files.map(file => file.secure_url).filter(url => url);
                        console.log('Reply upload - extracted URLs:', newUrls);
                        setReplyAttachmentUrls((prev) => {
                          const updated = [...prev, ...newUrls];
                          console.log('Reply upload - updated URLs:', updated);
                          return updated;
                        });
                      }}
                      maxFiles={3 - replyAttachmentUrls.length}
                      folder="support-tickets/replies"
                      buttonText={`Upload Files (${replyAttachmentUrls.length}/3)`}
                      className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-center hover:bg-gray-100 hover:border-nezeza_dark_blue transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          Add Files ({replyAttachmentUrls.length}/3)
                        </span>
                      </div>
                    </CloudinaryUploadWidget>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p>• Supported formats: Images, PDF, DOC, DOCX, TXT, ZIP, XLS, XLSX</p>
                    <p>• Maximum file size: 10MB per file</p>
                    <p>• Maximum 3 files per reply</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingMessage || !newMessage.trim()}
                  className="bg-nezeza_dark_blue text-white px-6 py-2 rounded-lg hover:bg-nezeza_dark_blue_2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingMessage ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Using offline data</p>
          <p className="text-sm">Unable to connect to server: {error}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Support Tickets</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="order_issue">Order Issues</option>
            <option value="payment_problem">Payment Problems</option>
            <option value="shipping_delay">Shipping & Delivery</option>
            <option value="product_quality">Product Quality</option>
            <option value="refund_request">Returns & Refunds</option>
            <option value="account_access">Account Issues</option>
            <option value="technical_support">Technical Support</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'in_progress').length}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{tickets.filter(t => t.priority === 'urgent').length}</div>
          <div className="text-sm text-gray-600">Urgent</div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">You don't have any support tickets matching the current filters.</p>
            <button 
              onClick={() => {
                setFilterStatus('all');
                setFilterCategory('all');
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => handleTicketSelect(ticket)}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">{getCategoryIcon(ticket.category || 'other')}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>#{ticket.ticketNumber}</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    <span>Updated {formatDate(ticket.updatedAt || ticket.createdAt)}</span>
                    {ticket.orderId && <span className="text-blue-600">Order: {ticket.orderId._id || 'N/A'}</span>}
                    {ticket.messages && (
                      <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerSupportMyTickets;
