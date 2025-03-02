import axiosInstance from '../axiosInstance';

export const createCustomerSession = async () => {
  try {
    const response = await axiosInstance.post(
      '/payment/create-customer-session'
    );
    return response.data.customer_session_client_secret;
  } catch (error) {
    throw error; // Let the component handle the error
  }
};
