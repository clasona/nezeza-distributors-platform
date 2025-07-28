'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import AdminLayout from '..';

// Mock admin user data
const mockAdminUser = {
  id: '1',
  name: 'Sarah Johnson',
  role: 'Senior Support Agent',
  avatar: '/api/placeholder/32/32',
  team: 'Customer Success'
};

// Mock ticket data with realistic ecommerce scenarios
const mockTickets: SupportTicket[] = [
  {
    _id: '1',
    ticketNumber: 'VS-2024-001',
    subject: 'Order not delivered - Customer requesting refund',
    category: 'shipping_delay',
    priority: 'high',
    status: 'in_progress',
    description: 'Customer ordered Samsung Galaxy A54 on Jan 15th. Package shows delivered but customer hasn\'t received it.',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-21T14:20:00Z',
    orderId: 'VS-ORD-2024-123',
    userId: { firstName: 'John', lastName: 'Mugisha', email: 'john.mugisha@email.com' },
    userRole: 'customer',
    assignedTo: { firstName: 'Sarah', lastName: 'Johnson' },
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'John Mugisha',
        content: 'Hello, I ordered a Samsung Galaxy A54 on January 15th and the tracking shows it was delivered yesterday, but I haven\'t received anything. Can you please help me locate my package?',
        timestamp: '2024-01-20T10:30:00Z',
        attachments: []
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Sarah Johnson',
        content: 'Hi John, I\'m sorry to hear about this issue. I\'ve contacted our shipping partner and they\'re investigating the delivery. I\'ll get back to you within 2 hours with an update.',
        timestamp: '2024-01-20T15:45:00Z',
        attachments: []
      }
    ]
  },
  {
    _id: '2',
    ticketNumber: 'VS-2024-002',
    subject: 'Payment failed but amount deducted from bank',
    category: 'payment_problem',
    priority: 'urgent',
    status: 'open',
    description: 'Customer\'s payment failed during checkout but amount was deducted from bank account.',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    orderId: null,
    userId: { firstName: 'Marie', lastName: 'Uwimana', email: 'marie.uwimana@email.com' },
    userRole: 'customer',
    assignedTo: null,
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'Marie Uwimana',
        content: 'I tried to buy Nike Air Max shoes yesterday but the payment failed. However, RWF 45,000 was deducted from my bank account. Please help me get my money back or complete the order.',
        timestamp: '2024-01-22T11:00:00Z',
        attachments: [{ name: 'bank_statement.pdf', url: '#' }]
      }
    ]
  },
  {
    _id: '3',
    ticketNumber: 'VS-2024-003',
    subject: 'Wholesaler requesting bulk discount rates',
    category: 'billing_inquiry',
    priority: 'medium',
    status: 'waiting_customer',
    description: 'Wholesaler customer asking about volume discounts for electronics orders.',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
    orderId: null,
    userId: { firstName: 'Tech', lastName: 'Solutions Ltd', email: 'orders@techsolutions.rw' },
    userRole: 'wholesaler',
    assignedTo: { firstName: 'Mike', lastName: 'Chen' },
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'Tech Solutions Ltd',
        content: 'Hello, we\'re interested in ordering 50+ smartphones monthly. Do you offer bulk pricing for wholesalers? What are your minimum order quantities?',
        timestamp: '2024-01-19T14:30:00Z',
        attachments: []
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Mike Chen',
        content: 'Thank you for your interest! For orders of 50+ units, we offer tiered discounts starting at 8% for electronics. I\'ll send you our wholesale pricing sheet. Can you confirm your business registration details?',
        timestamp: '2024-01-20T10:20:00Z',
        attachments: [{ name: 'wholesale_pricing_2024.pdf', url: '#' }]
      }
    ]
  },
  {
    _id: '4',
    ticketNumber: 'VS-2024-004',
    subject: 'Product quality complaint - Damaged laptop',
    category: 'product_quality',
    priority: 'high',
    status: 'resolved',
    description: 'Customer received damaged laptop, requesting replacement.',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-21T16:30:00Z',
    orderId: 'VS-ORD-2024-456',
    userId: { firstName: 'David', lastName: 'Nkurunziza', email: 'david.nk@email.com' },
    userRole: 'customer',
    assignedTo: { firstName: 'Sarah', lastName: 'Johnson' },
    messages: [
      {
        id: '1',
        author: 'customer',
        authorName: 'David Nkurunziza',
        content: 'I received my laptop order yesterday but the screen is cracked and there\'s damage to the keyboard. This looks like shipping damage.',
        timestamp: '2024-01-18T09:15:00Z',
        attachments: [{ name: 'laptop_damage_photos.zip', url: '#' }]
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Sarah Johnson',
        content: 'I\'m very sorry about the damaged laptop. I\'ve approved an immediate replacement which will be shipped today via express delivery. You should receive it tomorrow. Please keep the damaged unit for our courier to collect.',
        timestamp: '2024-01-18T14:20:00Z',
        attachments: []
      },
      {
        id: '3',
        author: 'customer',
        authorName: 'David Nkurunziza',
        content: 'Perfect! I received the replacement laptop today and it\'s in excellent condition. Thank you for the quick resolution!',
        timestamp: '2024-01-21T16:30:00Z',
        attachments: []
      }
    ]
  }
];

// Mock team stats
const mockTeamStats = {
  totalTickets: 147,
  openTickets: 23,
  myTickets: 8,
  urgentTickets: 3,
  overdueTickets: 2,
  categories: [
    { name: 'Order Issues', count: 45, icon: 'order' },
    { name: 'Payment Problems', count: 28, icon: 'payment' },
    { name: 'Shipping Delays', count: 34, icon: 'shipping' },
    { name: 'Product Quality', count: 19, icon: 'quality' },
    { name: 'Returns & Refunds', count: 21, icon: 'returns' }
  ],
  agents: [
    { name: 'Sarah Johnson', tickets: 12, status: 'online' },
    { name: 'Mike Chen', tickets: 8, status: 'online' },
    { name: 'Lisa Park', tickets: 15, status: 'away' },
    { name: 'James Wilson', tickets: 6, status: 'offline' }
  ]
};

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

const AdminSupportPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<ExtendedSupportTicket | null>(null);
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>(mockTickets);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_customer': return 'bg-orange-100 text-orange-800';
      case 'waiting_admin': return 'bg-purple-100 text-purple-800';
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
        return <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>;
      case 'payment_problem': 
        return <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>;
      case 'shipping_delay': 
        return <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'product_quality': 
        return <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>;
      case 'refund_request': 
        return <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>;
      case 'account_access': 
        return <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>;
      case 'technical_support': 
        return <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>;
      case 'billing_inquiry': 
        return <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>;
      default: 
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'all' || ticket.status === activeFilter;
    const matchesSearch = !searchQuery || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${ticket.userId.firstName} ${ticket.userId.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTicketSelect = (ticket: ExtendedSupportTicket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket._id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
        : ticket
    ));
    
    if (selectedTicket && selectedTicket._id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAssignTicket = (ticketId: string, agentName: string) => {
    const [firstName, lastName] = agentName.split(' ');
    setTickets(prev => prev.map(ticket => 
      ticket._id === ticketId 
        ? { ...ticket, assignedTo: { firstName, lastName }, updatedAt: new Date().toISOString() }
        : ticket
    ));
    
    if (selectedTicket && selectedTicket._id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, assignedTo: { firstName, lastName } } : null);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmittingMessage(true);
    
    setTimeout(() => {
      const newMsg: TicketMessage = {
        id: Date.now().toString(),
        author: 'admin',
        authorName: mockAdminUser.name,
        content: newMessage,
        timestamp: new Date().toISOString(),
        attachments: selectedFiles.map(file => ({ name: file.name, url: '#' }))
      };

      const updatedTicket = {
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), newMsg],
        updatedAt: new Date().toISOString(),
        status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
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

  return (

    <AdminLayout>

    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vesoko Support</h1>
              <p className="text-sm text-gray-600">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <span className="text-blue-600 font-semibold text-sm">SJ</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{mockAdminUser.name}</p>
              <p className="text-xs text-gray-500">{mockAdminUser.role}</p>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockTeamStats.totalTickets}</div>
              <div className="text-xs text-blue-600">Total Tickets</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{mockTeamStats.openTickets}</div>
              <div className="text-xs text-orange-600">Open</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{mockTeamStats.myTickets}</div>
              <div className="text-xs text-green-600">My Tickets</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{mockTeamStats.urgentTickets}</div>
              <div className="text-xs text-red-600">Urgent</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tickets by Status</h3>
          <div className="space-y-1">
            {[
              { key: 'all', label: 'All Tickets', count: mockTeamStats.totalTickets },
              { key: 'open', label: 'Open', count: 23 },
              { key: 'in_progress', label: 'In Progress', count: 45 },
              { key: 'waiting_customer', label: 'Waiting Customer', count: 12 },
              { key: 'resolved', label: 'Resolved', count: 58 },
              { key: 'urgent', label: 'Urgent Priority', count: 3, priority: true }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  activeFilter === filter.key 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={filter.priority ? 'text-red-600' : ''}>{filter.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeFilter === filter.key 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Team Members</h3>
          <div className="space-y-2">
            {mockTeamStats.agents.map((agent, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="relative">
                  <div className="bg-gray-200 rounded-full p-1">
                    <span className="text-xs font-medium text-gray-600">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    agent.status === 'online' ? 'bg-green-400' : 
                    agent.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.tickets} tickets</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Ticket List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No tickets found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => handleTicketSelect(ticket)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?._id === ticket._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getCategoryIcon(ticket.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h4>
                        <p className="text-xs text-gray-500 mt-1">#{ticket.ticketNumber}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {ticket.userId.firstName} {ticket.userId.lastName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(ticket.updatedAt).split(',')[0]}
                          </span>
                        </div>
                        {ticket.assignedTo && (
                          <div className="mt-1">
                            <span className="text-xs text-blue-600">
                              Assigned to {ticket.assignedTo.firstName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-600">Ticket #{selectedTicket.ticketNumber}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting Customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedTicket.assignedTo ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}` : ''}
                      onChange={(e) => handleAssignTicket(selectedTicket._id, e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {mockTeamStats.agents.map(agent => (
                        <option key={agent.name} value={agent.name}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Customer:</span>
                    <p className="text-gray-900">{selectedTicket.userId.firstName} {selectedTicket.userId.lastName}</p>
                    <p className="text-gray-500 text-xs">{selectedTicket.userRole}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Priority:</span>
                    <p className={`font-medium ${selectedTicket.priority === 'urgent' ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <p className="text-gray-900">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <p className="text-gray-900">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.messages?.map((message) => (
                  <div key={message.id} className={`flex ${message.author === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${
                      message.author === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.authorName}</span>
                        <span className={`text-xs ${
                          message.author === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-opacity-20">
                          <p className="text-xs mb-2 opacity-75">Attachments:</p>
                          {message.attachments.map((attachment, idx) => (
                            <a key={idx} href={attachment.url} className="text-xs underline block hover:no-underline flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="bg-white border-t border-gray-200 p-6">
                  <form onSubmit={handleSubmitMessage} className="space-y-4">
                    <div>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedTicket._id, 'resolved')}
                          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                        >
                          Mark Resolved
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingMessage || !newMessage.trim()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmittingMessage ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a ticket to view details</h3>
                <p className="text-gray-600">Choose a ticket from the list to start managing it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </AdminLayout>
  );
};

export default AdminSupportPage;
