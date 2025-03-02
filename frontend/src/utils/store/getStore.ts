import axiosInstance from '../axiosInstance';

export const getStore = async (storeId: string) => {
  
  try {
    const response = await axiosInstance.get(`/store/${storeId}`);

    if (response.status !== 200) {
      console.log('store data data not fetched.');
      return null;
    } else {
      return response.data.store;
    }
  } catch (error: any) {
    throw error;
  }

};

export const getStoreName = async (storeId: string) => {
  try {
    const response = await axiosInstance.get(`/store/${storeId}`);

    if (response.status !== 200) {
      console.log('store data data not fetched.');
      return null;
    } else {
      return response.data.store.name;
    }
  } catch (error: any) {
    throw error;
  }
};
