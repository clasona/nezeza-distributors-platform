import axiosInstance from '../axiosInstance';

interface ApproveApplicationData {
  applicationId: string;
}

interface DeclineApplicationData {
  applicationId: string;
  reason: string;
}

/**
 * Approve a store application
 */
export const approveStoreApplication = async (data: ApproveApplicationData) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/store-applications/${data.applicationId}/approve`
    );
    return response.data;
  } catch (error) {
    console.error('Error approving store application:', error);
    throw error;
  }
};

/**
 * Decline a store application
 */
export const declineStoreApplication = async (data: DeclineApplicationData) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/store-applications/${data.applicationId}/decline`,
      { reason: data.reason }
    );
    return response.data;
  } catch (error) {
    console.error('Error declining store application:', error);
    throw error;
  }
};

/**
 * Delete a store application
 */
export const deleteStoreApplication = async (applicationId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/store-applications/${applicationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting store application:', error);
    throw error;
  }
};

/**
 * Get store application details
 */
export const getStoreApplicationDetails = async (applicationId: string) => {
  try {
    const response = await axiosInstance.get(
      `/admin/store-applications/${applicationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting store application details:', error);
    throw error;
  }
};

/**
 * Get all store applications with pagination and filters
 */
export const getAllStoreApplications = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  name?: string;
  sort?: string;
}) => {
  try {
    const response = await axiosInstance.get('/admin/store-applications', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error getting store applications:', error);
    throw error;
  }
};

/**
 * Get store applications analytics
 */
export const getStoreApplicationsAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/admin/store-applications/analytics/overview');
    return response.data;
  } catch (error) {
    console.error('Error getting store applications analytics:', error);
    throw error;
  }
};
