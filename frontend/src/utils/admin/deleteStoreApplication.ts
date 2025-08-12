import axiosInstance from '../axiosInstance';

export const deleteStoreApplication = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/store-applications/${id}`
    );
    return response;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
