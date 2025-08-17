import axiosInstance from '../axiosInstance';

import { SupportTicket } from './createSupportTicket';

interface AddMessageData {
  message: string;
  attachments?: File[];
  cloudinaryAttachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    public_id: string;
  }>;
}

export const addMessageToTicket = async (ticketId: string, data: AddMessageData): Promise<{ success: boolean; ticket: SupportTicket }> => {
  try {
    const formData = new FormData();
    formData.append('message', data.message);
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    // Add Cloudinary attachments if any
    if (data.cloudinaryAttachments && data.cloudinaryAttachments.length > 0) {
      formData.append('cloudinaryAttachments', JSON.stringify(data.cloudinaryAttachments));
    }
    
    const response = await axiosInstance.post(`/support/tickets/${ticketId}/message`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add message to ticket');
  }
};
