import axiosInstance from '../axiosInstance';

export interface BulkUpdateParams {
  status?: string;
  priority?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface BulkUpdateTicketsRequest {
  ticketIds: string[];
  updates: BulkUpdateParams;
}

export interface BulkUpdateResponse {
  success: boolean;
  message: string;
  modifiedCount: number;
}

export const bulkUpdateTickets = async (data: BulkUpdateTicketsRequest): Promise<BulkUpdateResponse> => {
  try {
    const response = await axiosInstance.patch('/admin/support/tickets/bulk', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to bulk update tickets');
  }
};
