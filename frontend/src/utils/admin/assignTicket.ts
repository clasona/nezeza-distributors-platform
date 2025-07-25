import axiosInstance from '../axiosInstance';
import { SupportTicket } from '../support/createSupportTicket';

export const assignTicket = async (
  ticketId: string, 
  assignedTo: string
): Promise<{ success: boolean; ticket: SupportTicket; message: string }> => {
  try {
    const response = await axiosInstance.patch(`/admin/support/tickets/${ticketId}/assign`, {
      assignedTo,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to assign ticket');
  }
}; 