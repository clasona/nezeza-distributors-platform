import axiosInstance from '../axiosInstance';

export const getStoreApplication = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/admin/store-application/${id}`);
    console.log('Store application details:', response.data);
    return response;
  } catch (error) {
    throw error;
  }
};
