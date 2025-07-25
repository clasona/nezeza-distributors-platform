import axiosInstance from '../axiosInstance';
import { SupportTicket } from './createSupportTicket';

export interface GetUserTicketsParams {
  status?: string;
  category?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUserTicketsResponse {
  success: boolean;
  tickets: SupportTicket[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const getUserTickets = async (params: GetUserTicketsParams = {}): Promise<GetUserTicketsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await axiosInstance.get(`/support/my-tickets?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch support tickets');
  }
}; 