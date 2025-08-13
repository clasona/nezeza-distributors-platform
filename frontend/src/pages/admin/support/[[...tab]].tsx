'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AdminSupportTicketList from '@/components/Support/AdminSupport/AdminSupportTicketList';
import AdminSupportDashboard from '@/components/Support/AdminSupport/AdminSupportDashboard';
import AdminLayout from '..';
import { SupportTicket } from '@/utils/support/createSupportTicket';
import Button from '@/components/FormInputs/Button';

const AdminSupportPage = () => {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('tickets');

  // Get the tab from URL params
  useEffect(() => {
    const tab = params?.tab?.[0] || 'tickets';
    setActiveTab(tab);
  }, [params]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin/support/${tab}`);
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Ticket clicked:', ticket._id);
    console.log('Navigating to:', `/admin/support/ticket/${ticket._id}`);
    router.push(`/admin/support/ticket/${ticket._id}`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tickets', label: 'All Tickets' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
          <p className="text-gray-600 mt-1">Manage customer support tickets and view analytics</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-nezeza_dark_blue text-nezeza_dark_blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <AdminSupportDashboard />
          )}
          
          {activeTab === 'tickets' && (
            <AdminSupportTicketList onTicketSelect={handleTicketSelect} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportPage;
