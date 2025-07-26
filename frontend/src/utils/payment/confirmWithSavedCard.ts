import axiosInstance from '../axiosInstance';

export const confirmWithSavedCard = async (paymentIntentId: string) => {
  try {
    const response = await axiosInstance.post('/payment/confirm-with-saved-card', { paymentIntentId });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
