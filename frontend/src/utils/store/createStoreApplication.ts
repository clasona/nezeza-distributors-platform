
import { CreateStoreApplicationProps } from '../../../type';
import axiosInstance from '../axiosInstance';

export const createStoreApplication = async (
  storeApplicationData: CreateStoreApplicationProps
) => {
  try {
    const response = await axiosInstance.post(
      '/store-application',
      storeApplicationData
    );
    return response;
  } catch (error) {
    throw error;
  }
};
