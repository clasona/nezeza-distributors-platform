import axiosInstance from '../axiosInstance';

export const cancelFullOrder = async( 
    orderId: string,
    reason: string
    ) => {
    try {
        const response = await axiosInstance.post(
          `orders/${orderId.toString()}/cancel`,
          {
            reason
          }
        );
        
        if (response.status !== 200) {
        throw new Error('Failed to cancel full order');
        }
        
        return response.data; // Returns success message or updated order data
    } catch (error: any) {
        throw error; // Let the component handle the error
    }
    }