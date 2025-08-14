import axiosInstance from '../axiosInstance';
import { SupportTicket } from './createSupportTicket';

export interface AddMessageData {
  message: string;
  attachments?: File[] | string[]; // Either File objects or Cloudinary URLs
  cloudinaryAttachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    public_id: string;
  }>;
}

export const addMessageToTicket = async (
  ticketId: string, 
  data: AddMessageData
): Promise<{ success: boolean; ticket: SupportTicket; message: string }> => {
  try {
    const formData = new FormData();
    formData.append('message', data.message);
    
    if (data.attachments && data.attachments.length > 0) {
      // Check if attachments are URLs (strings) or File objects
      const isUrlArray = data.attachments.every(item => typeof item === 'string');
      
      if (isUrlArray) {
        // Send Cloudinary URLs directly as attachments
        formData.append('attachments', JSON.stringify(data.attachments));
      } else {
        // Send File objects for traditional upload
        data.attachments.forEach((file) => {
          if (file instanceof File) {
            formData.append('attachments', file);
          }
        });
      }
    }
    
    // Add Cloudinary attachments if any (legacy support)
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
