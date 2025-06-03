import axiosInstance from '../axiosInstance';

export const hasActiveStripeConnectAccount = async (id: string) => {
  try {
    const response = await axiosInstance.get(
      `/payment/has-active-stripe-account/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error('Error creating stripe account:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
