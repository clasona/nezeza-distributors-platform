import axios from 'axios';
import { handleAxiosError } from '../errorUtils';

export const createCustomerSession = async () => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/v1/payment/create-customer-session`,
      {
        withCredentials: true, // Include credentials like cookies for authorization
      }
    );
    const customer_session_client_secret =
      response.data.customer_session_client_secret;

    if (response.status !== 200) {
      console.log('error creating customer session secret.');
      return null;
    } else {
      console.log('customer session secret created successfully...');
      return customer_session_client_secret;
    }
  } catch (error: any) {
    return handleAxiosError(error); // Use the utility function
  }
};
