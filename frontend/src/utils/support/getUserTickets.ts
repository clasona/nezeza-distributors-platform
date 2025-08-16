import axiosInstance from '../axiosInstance';
import { SupportTicket } from './createSupportTicket';

export const getUserTickets = async (): Promise<{ success: boolean; tickets: SupportTicket[] }> => {
  try {
    const response = await axiosInstance.get('/support/my-tickets');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user tickets');
  }
};
