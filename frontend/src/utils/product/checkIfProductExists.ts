import axiosInstance from '../axiosInstance';

export const checkIfProductExists = async (productId: string) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);

    if (response.status !== 200) {
      console.log(`product with id:${productId} not found.`);
      return null;
    } else {
      return response.data.product;
    }
  } catch (error: any) {
    throw error;
  }
};
