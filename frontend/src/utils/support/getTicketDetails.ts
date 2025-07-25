import axiosInstance from '../axiosInstance';
import { SupportTicket } from './createSupportTicket';

export const getTicketDetails = async (ticketId: string): Promise<{ success: boolean; ticket: SupportTicket }> => {
  try {
    const response = await axiosInstance.get(`/support/tickets/${ticketId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ticket details');
  }
}; 