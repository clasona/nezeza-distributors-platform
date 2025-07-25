import axiosInstance from '../axiosInstance';
import { SupportTicket } from '../support/createSupportTicket';

export interface RespondToTicketData {
  message: string;
  isInternal?: boolean;
  attachments?: File[];
}

export const respondToTicket = async (
  ticketId: string, 
  data: RespondToTicketData
): Promise<{ success: boolean; ticket: SupportTicket; message: string }> => {
  try {
    const formData = new FormData();
    formData.append('message', data.message);
    
    if (data.isInternal !== undefined) {
      formData.append('isInternal', data.isInternal.toString());
    }
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await axiosInstance.post(`/admin/support/tickets/${ticketId}/respond`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to respond to ticket');
  }
}; 