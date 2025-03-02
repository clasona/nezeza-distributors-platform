import axiosInstance from '../axiosInstance';

export const confirmOrderPayment = async (orderId: string, paymentIntentId: string) => {
  try {
    const response = await axiosInstance.post('/payment/confirm-payment', {
      orderId,
      paymentIntentId,
    });
    return response.data;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
