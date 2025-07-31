'use client';

import { useRouter } from 'next/navigation';
import AdminSupportTicketList from '@/components/Support/AdminSupport/AdminSupportTicketList';
import AdminLayout from '..';
import { SupportTicket } from '@/utils/support/createSupportTicket';

const AdminSupportPage = () => {
  const router = useRouter();

  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Ticket clicked:', ticket._id);
    console.log('Navigating to:', `/admin/support/ticket/${ticket._id}`);
    router.push(`/admin/support/ticket/${ticket._id}`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage customer support tickets and inquiries</p>
        </div>
        
        <AdminSupportTicketList onTicketSelect={handleTicketSelect} />
      </div>
    </AdminLayout>
  );
};

export default AdminSupportPage;
