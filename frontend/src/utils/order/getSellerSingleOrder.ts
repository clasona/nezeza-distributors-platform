
import axiosInstance from '../axiosInstance';
import { OrderProps, SubOrderProps } from '../../../type';

export const getSellerSingleOrder = async (id: string): Promise<SubOrderProps | null> => {
  try {
    const response = await axiosInstance.get(`/orders/selling/${id}`);

    if (response.status !== 200) {
      console.log('SubOrder data not fetched.');
      return null;
    } else {
      console.log('SubOrder data fetched successfully...');
      return response.data.order;
    }
  } catch (error) {
    console.error('Error fetching SubOrder data:', error);
    return null;
  }
}