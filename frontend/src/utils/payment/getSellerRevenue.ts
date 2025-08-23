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
    console.log('🔍 [getSellerRevenue] Making API call to:', `/payment/seller-revenue/${sellerId}`);
    const response = await axiosInstance.get(`/payment/seller-revenue/${sellerId}`);
    
    console.log('🔍 [getSellerRevenue] API response status:', response.status);
    console.log('🔍 [getSellerRevenue] API response data:', response.data);
    
    if (response.status === 200) {
      console.log('✅ [getSellerRevenue] Successfully fetched seller balance');
      return response.data;
    } else {
      console.warn('⚠️ [getSellerRevenue] Failed to fetch seller revenue:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getSellerRevenue] Error fetching seller revenue:');
    console.error('❌ [getSellerRevenue] Error details:', error);
    console.error('❌ [getSellerRevenue] Error response:', error.response?.data);
    console.error('❌ [getSellerRevenue] Error status:', error.response?.status);
    handleError(error);
    return null;
  }
};
