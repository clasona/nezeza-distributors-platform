import axios from 'axios';
import { handleAxiosError } from '../errorUtils';

export const checkIfProductExists = async (productId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/v1/products/${productId}`,
      { withCredentials: true }
    );

    if (response.status === 200) {
      return response.data.product;
    } else {
      console.error(`Unexpected status code: ${response.status}`); 
      return null; 
    }
  } catch (error: any) {
    return handleAxiosError(error); // Use the utility function
  }
};
