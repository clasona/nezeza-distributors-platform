import axiosInstance from '../axiosInstance';

export const cancelSingleOrderProduct = async( 
    orderId: string,
    itemId: string,
    quantity: number,
    reason: string
    ) => {
    try {
        const response = await axiosInstance.post(
          `orders/${orderId.toString()}/${itemId.toString()}/cancel`,
          {
            quantity,
            reason
          }
        );
        
        if (response.status !== 200) {
        throw new Error('Failed to cancel the order item');
        }
        
        return response.data; // Returns success message or updated order data
    } catch (error: any) {
        throw error; // Let the component handle the error
    }
    }