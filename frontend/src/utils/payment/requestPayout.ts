import axiosInstance from '../axiosInstance';
import { handleError } from '../errorUtils';

export interface PayoutRequest {
  sellerId: string;
  amount: number;
}

export interface PayoutResponse {
  msg: string;
  success?: boolean;
}

export const requestPayout = async (payoutData: PayoutRequest): Promise<PayoutResponse | null> => {
  try {
    const response = await axiosInstance.post('/payment/request-payout', payoutData);
    
    if (response.status === 200) {
      return response.data;
    } else {
      console.warn('Failed to request payout:', response.data);
      return response.data;
    }
  } catch (error: any) {
    console.error('Error requesting payout:', error);
    const errorMessage = error.response?.data?.msg || 'Failed to request payout';
    handleError(error);
    return {
      msg: errorMessage,
      success: false
    };
  }
};
