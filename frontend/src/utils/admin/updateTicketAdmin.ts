import axiosInstance from '../axiosInstance';
import { SupportTicket } from '../support/createSupportTicket';

export interface UpdateTicketAdminData {
  status?: string;
  priority?: string;
  isEscalated?: boolean;
  tags?: string[];
  assignedTo?: string;
}

export const updateTicketAdmin = async (
  ticketId: string, 
  data: UpdateTicketAdminData
): Promise<{ success: boolean; ticket: SupportTicket; message: string }> => {
  try {
    const response = await axiosInstance.patch(`/admin/support/tickets/${ticketId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update ticket');
  }
};
