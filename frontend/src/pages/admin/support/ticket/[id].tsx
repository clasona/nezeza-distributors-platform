'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SupportTicketDetail from '@/components/Support/SupportCenter/SupportTicketDetail';
import { SupportTicket } from '@/utils/support/createSupportTicket';

const AdminTicketDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  // Get the ticket ID from the URL parameters
  const ticketId = params?.id as string;

  const handleBackToList = () => {
    router.push('/admin/support');
  };

  const handleTicketUpdate = (updatedTicket: SupportTicket) => {
    setTicket(updatedTicket);
  };

  // Show loading state if we don't have the ticket ID yet
  if (!ticketId) {
    return (
      <div className="max-w-6xl mx-auto mt-10 mb-4 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-4 px-4">
      <SupportTicketDetail
        ticketId={ticketId}
        onBack={handleBackToList}
        onTicketUpdate={handleTicketUpdate}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminTicketDetailPage; 