import axiosInstance from '../axiosInstance';

export const getRetailersProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/retailers');

    if (response.status !== 200) {
      console.log('retailers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    throw error;
  }
};

export const getWholesalersProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/wholesalers');

    if (response.status !== 200) {
      console.log('wholesalers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    throw error;
  }
};


export const getManufacturersProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/manufacturers');

    if (response.status !== 200) {
      console.log('manufacturers products data not fetched.');
      return null;
    } else {
      return response.data.products;
    }
  } catch (error: any) {
    throw error;
  }
};

