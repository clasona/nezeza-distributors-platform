import axiosInstance from '../axiosInstance';

export const assignTicket = async (ticketId: string, data: { assignedTo: string }): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.put(`/admin/support/tickets/${ticketId}/assign`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to assign ticket');
  }
};
