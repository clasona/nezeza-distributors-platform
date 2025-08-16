import axiosInstance from '../axiosInstance';

export interface SupportDashboard {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    recentTickets: number;
    recentResolved: number;
  };
  priorityBreakdown: Array<{ _id: string; count: number }>;
  categoryBreakdown: Array<{ _id: string; count: number }>;
  resolutionMetrics: {
    avgResolutionTime: number;
    minResolutionTime: number;
    maxResolutionTime: number;
  };
  satisfaction: {
    avgRating: number;
    totalRatings: number;
  };
  roleDistribution: Array<{ _id: string; count: number }>;
}

export const getSupportDashboard = async (): Promise<{ success: boolean; dashboard: SupportDashboard }> => {
  try {
    const response = await axiosInstance.get('/admin/support/dashboard');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch support dashboard');
  }
}; 