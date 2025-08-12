import axiosInstance from '../axiosInstance';

export interface StoreApplicationsAnalytics {
  statusCounts: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
  };
  monthlyTrend: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
  storeTypeBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  recentApplications: Array<{
    _id: string;
    status: string;
    storeInfo: { name: string };
    primaryContactInfo: { firstName: string; lastName: string };
    createdAt: string;
  }>;
  countryBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  processingTimeData: Array<{
    _id: string;
    avgProcessingTime: number;
    count: number;
  }>;
  totalApplications: number;
}

export const getStoreApplicationsAnalytics = async (): Promise<StoreApplicationsAnalytics> => {
  try {
    const response = await axiosInstance.get('/admin/store-applications/analytics/overview');

    if (response.status !== 200) {
      console.log('Store applications analytics data not fetched.');
      throw new Error('Failed to fetch analytics');
    }

    return response.data.analytics;
  } catch (error: any) {
    throw error;
  }
};
