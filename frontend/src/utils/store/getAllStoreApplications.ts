import axiosInstance from '../axiosInstance';

export const getAllStoreApplications = async () => {
  try {
    const response = await axiosInstance.get('/admin/store-applications');

    if (response.status !== 200) {
      console.log('store applications data not fetched.');
      return null;
    } else {
      return response.data.storeApplications;
    }
  } catch (error: any) {
    throw error;
  }
};
