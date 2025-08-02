import axiosInstance from '../axiosInstance';

export const updateTicketAdmin = async (ticketId: string, updates: any): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.put(`/admin/support/tickets/${ticketId}`, updates);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update ticket');
  }
};
