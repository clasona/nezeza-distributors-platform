import axios from 'axios';
import { handleAxiosError } from '../errorUtils';

export const confirmOrderPayment = async (orderId:string, paymentIntentId: string) => {
  try {
    const response = await axios.post(
        `http://localhost:8000/api/v1/payment/confirm-payment`,
        { orderId, paymentIntentId },
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const data = response.data;
    if (response.status !== 200) {
      console.log('error confirming payment.');
      return null;
    } else {
      console.log('payment confirmed successfully...');
      return data;
    }
  } catch (error: any) {
    return handleAxiosError(error); // Use the utility function
  }
};
