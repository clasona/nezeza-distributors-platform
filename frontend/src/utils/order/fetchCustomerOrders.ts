import axiosInstance from '../axiosInstance';

export const fetchCustomerOrders = async () => {
   try {
     const response = await axiosInstance.get('/orders/selling');

     if (response.status !== 200) {
       console.log('customer orders data not fetched.');
       return null;
     } else {
       
       return response.data.orders;
     }
   } catch (error: any) {
     throw error;
   }
};
