import axiosInstance from '../axiosInstance';
import { handleError } from '../errorUtils';

export interface SellerBalance {
  _id: string;
  sellerId: string;
  totalSales: number;
  commissionDeducted: number;
  netRevenue: number;
  pendingBalance: number;
  availableBalance: number;
  payouts: any[];
  createdAt: string;
  updatedAt: string;
}

export const getSellerRevenue = async (sellerId: string): Promise<SellerBalance | null> => {
  try {
    const response = await axiosInstance.get(`/payment/seller-revenue/${sellerId}`);
    
    if (response.status === 200) {
      return response.data;
    } else {
      console.warn('Failed to fetch seller revenue:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching seller revenue:', error);
    handleError(error);
    return null;
  }
};
