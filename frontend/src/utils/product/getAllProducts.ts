import axiosInstance from '../axiosInstance';

export const getAllProducts = async () => {
   try {
     const response = await axiosInstance.get('/products/all');

     if (response.status !== 200) {
       console.log('all products data not fetched.');
       return null;
     } else {
       return response.data.products;
     }
   } catch (error: any) {
     throw error;
   }
};
