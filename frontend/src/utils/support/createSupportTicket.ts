import axiosInstance from '../axiosInstance';

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  category: string;
  priority: string;
  orderId?: string;
  subOrderId?: string;
  productId?: string;
  attachments?: File[] | string[]; // Either File objects or Cloudinary URLs
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
    
    // Add attachments (either as File objects for traditional upload or as URLs for Cloudinary)
    if (data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0) {
      // Check if attachments are URLs (strings) or File objects
      const isUrlArray = data.attachments.every(item => typeof item === 'string');
      
      if (isUrlArray) {
        // Send Cloudinary URLs as attachments
        formData.append('attachments', JSON.stringify(data.attachments));
      } else {
        // Send File objects for traditional upload (fallback)
        data.attachments.forEach((file) => {
          if (file instanceof File) {
            formData.append('attachments', file);
          }
        });
      }
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
