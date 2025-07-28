import axiosInstance from '../axiosInstance';
import { ProductProps } from '../../../type';

export const createProduct = async (productData: Partial<ProductProps>) => {
  try {
    const response = await axiosInstance.post('/products', productData);

    if (response.status === 201) {
      return response.data; // Return the response data on success
    } else {
      throw new Error('Error creating product'); // Throw an error for other status codes
    }
  } catch (error) {
    console.error('Error creating product:', error);
    throw error; // Re-throw the error to allow the caller to handle it
  }
};
