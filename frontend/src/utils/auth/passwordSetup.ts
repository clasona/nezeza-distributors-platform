import axiosInstance from '../axiosInstance';

interface PasswordSetupData {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface VerifyTokenData {
  token: string;
  email: string;
}

interface ResendSetupData {
  email: string;
}

/**
 * Set up password for approved store applications
 */
export const setupPassword = async (data: PasswordSetupData) => {
  try {
    const response = await axiosInstance.post('/password-setup/setup', data);
    return response.data;
  } catch (error) {
    console.error('Error setting up password:', error);
    throw error;
  }
};

/**
 * Verify password setup token validity
 */
export const verifySetupToken = async (data: VerifyTokenData) => {
  try {
    const response = await axiosInstance.get('/password-setup/verify-token', {
      params: data
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying setup token:', error);
    throw error;
  }
};

/**
 * Resend password setup email
 */
export const resendPasswordSetup = async (data: ResendSetupData) => {
  try {
    const response = await axiosInstance.post('/password-setup/resend', data);
    return response.data;
  } catch (error) {
    console.error('Error resending password setup:', error);
    throw error;
  }
};
