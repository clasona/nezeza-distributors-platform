'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupportCenterLayout from '@/components/Support/SupportCenter/SupportCenter';

// Mock retailer business data
const mockRetailerBusiness = {
  businessName: 'TechHub Electronics',
  businessType: 'Electronics Retailer',
  accountManager: 'Sarah Johnson',
  monthlyOrders: 1250,
  totalRevenue: 'RWF 45,000,000',
  supportTier: 'Premium'
};

// Mock retailer-specific tickets with business context
const mockRetailerTickets = [
  {
    _id: '1',
    ticketNumber: 'RT-2024-001',
    subject: 'Bulk order discount request for Q1 electronics',
    category: 'billing_inquiry',
    priority: 'medium',
    status: 'in_progress',
    description: 'Requesting volume discount for planned Q1 smartphone orders (500+ units)',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-21T14:20:00Z',
    businessImpact: 'high',
    estimatedValue: 'RWF 15,000,000',
    messages: [
      {
        id: '1',
        author: 'retailer',
        authorName: 'TechHub Electronics',
        content: 'We are planning a major Q1 push for smartphones and expect to order 500+ units. Can we discuss volume pricing and payment terms?',
        timestamp: '2024-01-20T10:30:00Z',
        attachments: [{ name: 'Q1_forecast.xlsx', url: '#' }]
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Mike Chen - Account Manager',
        content: 'Thank you for reaching out! For orders of 500+ units, we offer tiered discounts starting at 12% for smartphones. I\'ll prepare a custom quote with flexible payment terms.',
        timestamp: '2024-01-20T15:45:00Z',
        attachments: []
      }
    ]
  },
  {
    _id: '2',
    ticketNumber: 'RT-2024-002',
    subject: 'Shipping delay affecting customer orders',
    category: 'shipping_delay',
    priority: 'urgent',
    status: 'open',
    description: 'Multiple customer orders delayed due to logistics issues. Need immediate resolution.',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    businessImpact: 'critical',
    affectedOrders: 23,
    messages: [
      {
        id: '1',
        author: 'retailer',
        authorName: 'TechHub Electronics',
        content: 'We have 23 customer orders that are now 3 days overdue. This is seriously affecting our customer relationships. Can you provide immediate updates and compensation for the delays?',
        timestamp: '2024-01-22T11:00:00Z',
        attachments: [{ name: 'affected_orders.pdf', url: '#' }]
      }
    ]
  },
  {
    _id: '3',
    ticketNumber: 'RT-2024-003',
    subject: 'New product onboarding for laptop category',
    category: 'product_inquiry',
    priority: 'low',
    status: 'resolved',
    description: 'Request to add new laptop models to our retailer catalog',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-21T16:30:00Z',
    businessImpact: 'medium',
    messages: [
      {
        id: '1',
        author: 'retailer',
        authorName: 'TechHub Electronics',
        content: 'We\'d like to expand our laptop offerings. Can you add the new Dell Inspiron series to our approved product catalog?',
        timestamp: '2024-01-18T09:15:00Z',
        attachments: []
      },
      {
        id: '2',
        author: 'admin',
        authorName: 'Product Team',
        content: 'Great news! I\'ve added 5 new Dell Inspiron models to your catalog. They\'re now available for ordering with your standard retailer pricing.',
        timestamp: '2024-01-21T16:30:00Z',
        attachments: [{ name: 'new_products_catalog.pdf', url: '#' }]
      }
    ]
  }
];

const TAB_MAP = {
  '': 'dashboard',
  'submit-ticket': 'submit-ticket',
  'my-tickets': 'my-tickets',
  'analytics': 'analytics',
  'faqs': 'faqs',
};

type TabValue = 'dashboard' | 'submit-ticket' | 'my-tickets' | 'analytics' | 'faqs';

const RetailerSupportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabValue>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [tickets, setTickets] = useState(mockRetailerTickets);

  useEffect(() => {
    const lastSegment = pathname?.split('/').pop() || '';
    const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'dashboard';
    setSelectedTab(mappedTab as TabValue);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const targetPath = `/retailer/support${value === 'dashboard' ? '' : `/${value}`}`;
    router.push(targetPath);
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

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-50 text-green-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'high': return 'bg-orange-50 text-orange-700';
      case 'critical': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Dashboard Content
  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Business Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Business Support Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{mockRetailerBusiness.businessName}</h3>
            <p className="text-gray-600">{mockRetailerBusiness.businessType}</p>
            <p className="text-sm text-blue-600 mt-2">{mockRetailerBusiness.supportTier} Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{mockRetailerBusiness.monthlyOrders}</div>
            <p className="text-gray-600">Monthly Orders</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mockRetailerBusiness.totalRevenue}</div>
            <p className="text-gray-600">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions for Retailers */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-700">Business Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">View detailed analytics about your support interactions, response times, and business impact metrics.</p>
          <button onClick={() => handleTabChange('analytics')} className="text-blue-600 font-medium hover:text-blue-800">View Analytics →</button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center mb-3">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-700">Volume Discounts</h3>
          </div>
          <p className="text-gray-600 mb-4">Request volume pricing, negotiate terms, and manage your bulk order discounts for better margins.</p>
          <button onClick={() => handleTabChange('submit-ticket')} className="text-green-600 font-medium hover:text-green-800">Request Pricing →</button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 011-1h4a2 2 0 011 1v12m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-purple-700">Account Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Connect with your dedicated account manager for business planning and strategic support.</p>
          <div className="text-purple-600 font-medium">Contact: {mockRetailerBusiness.accountManager}</div>
        </div>
      </section>

      {/* Recent Tickets */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Support Tickets</h3>
        <div className="space-y-4">
          {tickets.slice(0, 3).map((ticket) => (
            <div key={ticket._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>#{ticket.ticketNumber}</span>
                <span>Updated {formatDate(ticket.updatedAt).split(',')[0]}</span>
                {ticket.businessImpact && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getBusinessImpactColor(ticket.businessImpact)}`}>
                    {ticket.businessImpact} impact
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button onClick={() => handleTabChange('my-tickets')} className="text-blue-600 hover:text-blue-800 font-medium">
            View All Tickets →
          </button>
        </div>
      </section>
    </div>
  );

  // Enhanced My Tickets with business context
  const MyTicketsContent = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Business Support Tickets</h2>
        <button 
          onClick={() => handleTabChange('submit-ticket')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Support Request
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  {ticket.businessImpact && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusinessImpactColor(ticket.businessImpact)}`}>
                      {ticket.businessImpact.toUpperCase()} IMPACT
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{ticket.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>#{ticket.ticketNumber}</span>
                  <span>Created {formatDate(ticket.createdAt)}</span>
                  <span>Updated {formatDate(ticket.updatedAt)}</span>
                  {ticket.estimatedValue && <span className="text-green-600 font-medium">Value: {ticket.estimatedValue}</span>}
                  {ticket.affectedOrders && <span className="text-red-600 font-medium">{ticket.affectedOrders} orders affected</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Business Analytics Dashboard
  const AnalyticsContent = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600">2.4h</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">94%</div>
          <div className="text-sm text-gray-600">Resolution Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">RWF 2.3M</div>
          <div className="text-sm text-gray-600">Revenue Impact</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Support Categories</h3>
          <div className="space-y-3">
            {[
              { category: 'Volume Pricing', count: 5, percentage: 42 },
              { category: 'Shipping Issues', count: 3, percentage: 25 },
              { category: 'Product Inquiries', count: 2, percentage: 17 },
              { category: 'Account Management', count: 2, percentage: 16 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${item.percentage}%`}}></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Business Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Revenue at Risk</span>
              <span className="text-red-600 font-semibold">RWF 800K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Revenue Recovered</span>
              <span className="text-green-600 font-semibold">RWF 1.5M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Customer Satisfaction</span>
              <span className="text-blue-600 font-semibold">4.8/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Submit Ticket for Retailers
  const SubmitTicketContent = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit Business Support Request</h2>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Select request type...</option>
            <option value="volume_pricing">Volume Pricing Request</option>
            <option value="shipping_issue">Shipping/Logistics Issue</option>
            <option value="product_inquiry">Product Catalog Inquiry</option>
            <option value="account_management">Account Management</option>
            <option value="technical_support">Technical Support</option>
            <option value="billing_inquiry">Billing Question</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Impact *</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="low">Low - General inquiry</option>
            <option value="medium">Medium - Affects some operations</option>
            <option value="high">High - Significant business impact</option>
            <option value="critical">Critical - Revenue at risk</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of your business request"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (Optional)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., RWF 500,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed information about your business request, including any relevant order numbers, customer impact, or time sensitivity..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
          <input
            type="file"
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );

  // Retailer-specific FAQs
  const FAQContent = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Retailer Support FAQ</h2>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-700">Volume Pricing & Discounts</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">How do I qualify for volume discounts?</h4>
              <p className="text-gray-600 text-sm">Volume discounts start at 50+ units per month. Contact your account manager for custom pricing tiers.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What payment terms are available?</h4>
              <p className="text-gray-600 text-sm">We offer NET 30, NET 60, and custom payment terms based on your business volume and history.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-700">Business Operations</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">How do I add new products to my catalog?</h4>
              <p className="text-gray-600 text-sm">Submit a product inquiry ticket with the specific models you want to add. Our team will review and approve within 2 business days.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What are the minimum order quantities?</h4>
              <p className="text-gray-600 text-sm">MOQs vary by product category. Electronics typically have a MOQ of 10 units, while accessories have a MOQ of 25 units.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: 'Dashboard', value: 'dashboard', content: <DashboardContent /> },
    { label: 'Submit Request', value: 'submit-ticket', content: <SubmitTicketContent /> },
    { label: 'My Tickets', value: 'my-tickets', content: <MyTicketsContent /> },
    { label: 'Analytics', value: 'analytics', content: <AnalyticsContent /> },
    { label: 'FAQ', value: 'faqs', content: <FAQContent /> },
  ];

  const tabContent = tabs.find((tab) => tab.value === selectedTab)?.content;

  return (
    <SupportCenterLayout
      tabBar={
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className="max-w-7xl mx-auto mt-2 mb-4 px-4">
        {tabContent}
      </div>
    </SupportCenterLayout>
  );
};

export default RetailerSupportPage;
