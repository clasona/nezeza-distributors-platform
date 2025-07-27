import axiosInstance from '../axiosInstance';

export const getOrderByPaymentIntentId = async (paymentIntentId: string, maxRetries: number = 10) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await axiosInstance.get(
        `/orders/buying/payment/${paymentIntentId}`
      );

      if (response.status !== 200) {
        console.log('order data not fetched.');
        return null;
      } else {
        console.log('order data fetched successfully: ', response.data.order);
        return response.data.order;
      }
    } catch (error: any) {
      // If it's a 404 error (order not found), it might be because webhook hasn't processed yet
      if (error.response?.status === 404 && retryCount < maxRetries - 1) {
        console.log(`Order not found yet, retrying in ${(retryCount + 1) * 2} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
        
        // Wait with exponential backoff: 2s, 4s, 6s, 8s, etc.
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        retryCount++;
        continue;
      }
      
      // For other errors or if we've exhausted retries, throw the error
      throw error;
    }
  }
  
  // If we've exhausted all retries, throw a timeout error
  throw new Error('Timeout: Order creation is taking longer than expected. Please check your orders page.');
};
