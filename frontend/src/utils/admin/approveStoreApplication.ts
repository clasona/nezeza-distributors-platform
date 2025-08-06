import axiosInstance from '../axiosInstance';

export const approveStoreApplication = async (id: string) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/store-application/${id}/approve`
    );
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
