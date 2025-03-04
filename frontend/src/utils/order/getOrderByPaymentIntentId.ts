import axiosInstance from '../axiosInstance';

export const getOrderByPaymentIntentId = async (paymentIntentId: string) => {
  try {
    const response = await axiosInstance.get(
      `/orders/buying/payment/${paymentIntentId}`
    );

    if (response.status !== 200) {
      console.log('order data not fetched.');
      return null;
    } else {
      return response.data.order;
    }
  } catch (error: any) {
    throw error;
  }
};
