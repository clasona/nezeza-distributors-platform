import axiosInstance from '../axiosInstance';

export const sendSMSVerification = async (phone: string) => {
  try {
    const response = await axiosInstance.post('/verification/send-sms', {
      phone,
      type: 'store-application',
    });
    return response.data;
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    throw error;
  }
};

export const verifySMSCode = async (phone: string, code: string) => {
  try {
    const response = await axiosInstance.post('/verification/verify-sms', {
      phone,
      code,
      type: 'store-application',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error verifying SMS code:', error);
    // Extract error message from the response
    const errorMessage = error?.response?.data?.message || 
                        error?.response?.data?.msg || 
                        error?.message || 
                        'Invalid verification code';
    throw errorMessage;
  }
};
