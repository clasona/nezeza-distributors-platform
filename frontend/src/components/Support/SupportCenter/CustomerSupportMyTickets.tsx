'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';

// Mock ticket data - replace with actual API calls
const mockTickets: SupportTicket[] = [
  {
    _id: '1',
    ticketNumber: 'VS-2024-001',
    subject: 'Order not delivered yet',
    category: 'shipping_delay',
    priority: 'high',
    status: 'in_progress',
    description: 'My order was supposed to arrive yesterday but I haven\'t received it yet.',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-21T14:20:00Z',
    orderId: 'VS-ORD-2024-123',
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'You',
        content: 'My order was supposed to arrive yesterday but I haven\'t received it yet. Can you please check the status?',
        timestamp: '2024-01-20T10:30:00Z',
        attachments: []
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Sarah - Support Team',
        content: 'Hi! I\'m sorry to hear about the delay. I\'ve checked with our shipping partner and your package is currently at the local distribution center. It should be delivered today before 6 PM. I\'ll send you the tracking details.',
        timestamp: '2024-01-20T15:45:00Z',
        attachments: []
      },
      {
        id: '3',
        author: 'admin',
        authorName: 'Sarah - Support Team',
        content: 'Here\'s your tracking number: TRK123456789. You can also track it on our website.',
        timestamp: '2024-01-20T15:47:00Z',
        attachments: [{ name: 'tracking_details.pdf', url: '#' }]
      }
    ]
  },
  {
    _id: '2',
    ticketNumber: 'VS-2024-002',
    subject: 'Product quality issue',
    category: 'product_quality',
    priority: 'medium',
    status: 'resolved',
    description: 'The phone case I ordered has a scratch on the back.',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    orderId: 'VS-ORD-2024-098',
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'You',
        content: 'The phone case I ordered has a scratch on the back. It looks like it was damaged during shipping.',
        timestamp: '2024-01-18T09:15:00Z',
        attachments: [{ name: 'case_damage.jpg', url: '#' }]
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Mike - Quality Team',
        content: 'Thank you for reporting this issue. I can see from the photo that the case is indeed damaged. We\'ll send you a replacement immediately at no extra cost. You should receive it within 2-3 business days.',
        timestamp: '2024-01-18T14:20:00Z',
        attachments: []
      },
      {
        id: '3',
        author: 'customer',
        authorName: 'You',
        content: 'Thank you! I received the replacement and it\'s perfect. Great customer service!',
        timestamp: '2024-01-19T16:30:00Z',
        attachments: []
      }
    ]
  },
  {
    _id: '3',
    ticketNumber: 'VS-2024-003',
    subject: 'Payment failed but amount deducted',
    category: 'payment_problem',
    priority: 'urgent',
    status: 'open',
    description: 'My payment failed during checkout but the amount was deducted from my account.',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    orderId: null,
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'You',
        content: 'My payment failed during checkout but the amount was deducted from my account. Please help me resolve this issue.',
        timestamp: '2024-01-22T11:00:00Z',
        attachments: [{ name: 'bank_statement.pdf', url: '#' }]
      }
    ]
  }
];

interface TicketMessage {
  id: string;
  author: 'customer' | 'admin';
  authorName: string;
  content: string;
  timestamp: string;
  attachments: { name: string; url: string }[];
}

interface ExtendedSupportTicket extends SupportTicket {
  messages?: TicketMessage[];
}

const CustomerSupportMyTickets: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<ExtendedSupportTicket | null>(null);
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>(mockTickets);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

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
      case 'order_issue': return '📦';
      case 'payment_problem': return '💳';
      case 'shipping_delay': return '🚚';
      case 'product_quality': return '⭐';
      case 'refund_request': return '↩️';
      case 'account_access': return '👤';
      case 'technical_support': return '🔧';
      case 'billing_inquiry': return '📊';
      default: return '❓';
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmittingMessage(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMsg: TicketMessage = {
        id: Date.now().toString(),
        author: 'customer',
        authorName: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        attachments: selectedFiles.map(file => ({ name: file.name, url: '#' }))
      };

      const updatedTicket = {
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), newMsg],
        updatedAt: new Date().toISOString(),
        status: selectedTicket.status === 'resolved' ? 'in_progress' : selectedTicket.status
      };

      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t._id === selectedTicket._id ? updatedTicket : t));
      setNewMessage('');
      setSelectedFiles([]);
      setIsSubmittingMessage(false);
    }, 1000);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Category</span>
              <p className="flex items-center mt-1">
                <span className="mr-2">{getCategoryIcon(selectedTicket.category)}</span>
                {selectedTicket.category.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Created</span>
              <p className="mt-1">{formatDate(selectedTicket.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <p className="mt-1">{formatDate(selectedTicket.updatedAt)}</p>
            </div>
          </div>
          {selectedTicket.orderId && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm font-medium text-gray-500">Related Order</span>
              <p className="mt-1 text-blue-600 font-medium">{selectedTicket.orderId}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Conversation</h3>
          </div>
          <div className="p-6 space-y-6">
            {selectedTicket.messages?.map((message) => (
              <div key={message.id} className={`flex ${message.author === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${
                  message.author === 'customer' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{message.authorName}</span>
                    <span className={`text-xs ${
                      message.author === 'customer' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-opacity-20">
                      <p className="text-xs mb-2 opacity-75">Attachments:</p>
                      {message.attachments.map((attachment, idx) => (
                        <a key={idx} href={attachment.url} className="text-xs underline block hover:no-underline">
                          📎 {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                        <li key={index} className="flex items-center mt-1">
                          📎 {file.name}
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingMessage || !newMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

  return (
    <div className="max-w-6xl mx-auto">
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
                    <span className="text-xl">{getCategoryIcon(ticket.category)}</span>
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
                    <span>Updated {formatDate(ticket.updatedAt)}</span>
                    {ticket.orderId && <span className="text-blue-600">Order: {ticket.orderId}</span>}
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

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
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
    </div>
  );
};

export default CustomerSupportMyTickets;
