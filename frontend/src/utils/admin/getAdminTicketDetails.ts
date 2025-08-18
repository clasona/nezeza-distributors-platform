import axiosInstance from '../axiosInstance';
import { SupportTicket } from '../support/createSupportTicket';

export const getAdminTicketDetails = async (ticketId: string): Promise<{ success: boolean; ticket: SupportTicket }> => {
  try {
    const response = await axiosInstance.get(`/admin/support/tickets/${ticketId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ticket details');
  }
};
