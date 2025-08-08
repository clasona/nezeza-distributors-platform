import axiosInstance from '../axiosInstance';

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  orderId?: string;
  subOrderId?: string;
  productId?: string;
  attachments?: File[];
  cloudinaryAttachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    public_id: string;
  }>;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userRole: string;
  userStoreId?: {
    _id: string;
    name: string;
  };
  orderId?: {
    _id: string;
    totalAmount: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
  };
  productId?: {
    _id: string;
    title: string;
    price: number;
    image: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  messages: Array<{
    _id: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    senderRole: string;
    message: string;
    attachments: Array<{
      filename: string;
      url: string;
      fileType: string;
      fileSize: number;
    }>;
    isInternal: boolean;
    createdAt: string;
  }>;
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  satisfactionRating?: number;
  satisfactionFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const createSupportTicket = async (data: CreateSupportTicketData): Promise<{ success: boolean; ticket: SupportTicket; message: string }> => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('category', data.category);
    
    if (data.priority) {
      formData.append('priority', data.priority);
    }
    
    if (data.orderId) {
      formData.append('orderId', data.orderId);
    }
    
    if (data.subOrderId) {
      formData.append('subOrderId', data.subOrderId);
    }
    
    if (data.productId) {
      formData.append('productId', data.productId);
    }
    
    // Add attachments if any
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
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
