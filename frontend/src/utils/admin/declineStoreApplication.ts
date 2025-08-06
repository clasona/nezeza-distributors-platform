import axiosInstance from '../axiosInstance';

export const declineStoreApplication = async (id: string, reason: string) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/store-application/${id}/decline`,
      { reason }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
