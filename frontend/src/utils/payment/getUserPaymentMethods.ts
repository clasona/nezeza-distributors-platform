import axiosInstance from '../axiosInstance';

export const getUserPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get('/payment/user-payment-methods');
    return response.data.methods;
  } catch (error: any) {
    throw error;
  }
};
