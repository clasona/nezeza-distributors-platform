import axiosInstance from '../axiosInstance';

export const respondToTicket = async (ticketId: string, data: { message: string }): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.post(`/admin/support/tickets/${ticketId}/respond`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to respond to ticket');
  }
};
