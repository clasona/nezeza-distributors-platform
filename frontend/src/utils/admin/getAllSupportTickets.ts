import axiosInstance from '../axiosInstance';
import { SupportTicket } from '../support/createSupportTicket';

export interface GetAllTicketsParams {
  status?: string | string[];
  category?: string | string[];
  priority?: string | string[];
  userRole?: string;
  assignedTo?: string;
  isEscalated?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketStats {
  statusStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
}

export interface GetAllTicketsResponse {
  success: boolean;
  tickets: SupportTicket[];
  stats: TicketStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const getAllSupportTickets = async (params: GetAllTicketsParams = {}): Promise<GetAllTicketsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    const response = await axiosInstance.get(`/admin/support/tickets?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch support tickets');
  }
}; 