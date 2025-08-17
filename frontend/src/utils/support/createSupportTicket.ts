export interface SupportTicket {
  _id: string;
  subject: string;
  ticketNumber: string | number;
  userId?: {
    firstName: string;
    lastName: string;
  };
  userRole?: string;
  status: string;
  priority: string;
  category?: string;
  description?: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt?: string;
  orderId?: any;
  messages?: any[];
  attachments?: any[];
}

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  category: string;
  priority: string;
  attachments?: File[];
  cloudinaryAttachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    public_id: string;
  }>;
  orderId?: string;
}

import axiosInstance from '../axiosInstance';

export const createSupportTicket = async (data: CreateSupportTicketData): Promise<{ success: boolean; ticket: SupportTicket }> => {
  try {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    
    if (data.orderId) {
      formData.append('orderId', data.orderId);
    }
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }
    
    // Add Cloudinary attachments if any
    if (data.cloudinaryAttachments && data.cloudinaryAttachments.length > 0) {
      formData.append('cloudinaryAttachments', JSON.stringify(data.cloudinaryAttachments));
    }
    
    const response = await axiosInstance.post('/support', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create support ticket');
  }
};

