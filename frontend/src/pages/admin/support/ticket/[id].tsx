'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SupportTicketDetail from '@/components/Support/SupportCenter/SupportTicketDetail';
import { SupportTicket } from '@/utils/support/createSupportTicket';

interface AdminTicketDetailPageProps {
  params: {
    id: string;
  };
}

const AdminTicketDetailPage: React.FC<AdminTicketDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const handleBackToList = () => {
    router.push('/admin/support/tickets');
  };

  const handleTicketUpdate = (updatedTicket: SupportTicket) => {
    setTicket(updatedTicket);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-4 px-4">
      <SupportTicketDetail
        ticketId={params.id}
        onBack={handleBackToList}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default AdminTicketDetailPage; 