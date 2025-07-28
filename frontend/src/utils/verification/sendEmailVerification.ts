import axiosInstance from '../axiosInstance';

export const sendEmailVerification = async (email: string) => {
  try {
    const response = await axiosInstance.post('/verification/send-email', {
      email,
      type: 'store-application',
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

export const verifyEmailCode = async (email: string, code: string) => {
  try {
    const response = await axiosInstance.post('/verification/verify-email', {
      email,
      code,
      type: 'store-application',
    });
    return response.data;
  } catch (error: any) {
    console.error('Error verifying email code:', error);
    // Extract error message from the response
    const errorMessage = error?.response?.data?.message || 
                        error?.response?.data?.msg || 
                        error?.message || 
                        'Invalid verification code';
    throw errorMessage;
  }
};
