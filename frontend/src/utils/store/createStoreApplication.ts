
import { StoreApplicationProps } from '../../../type';

import axiosInstance from '../axiosInstance';

export const createStoreApplication = async (storeApplicationData: StoreApplicationProps) => {
  console.log('yeyeyeyeyeye')
  console.log(storeApplicationData)
  try {
    const response = await axiosInstance.post('/store-application', 
      storeApplicationData,
    );
    return response;
  } catch (error) {
    throw error; 
  }
};
