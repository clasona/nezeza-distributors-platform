import axiosInstance from '../axiosInstance';
import { handleError } from '../errorUtils';

export interface RealTransaction {
  _id: string;
  type: 'Sale' | 'Payout' | 'Commission' | 'Refund';
  amount: number;
  grossAmount: number;
  commission: number;
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  orderId?: string;
  orderNumber?: string;
  buyerName?: string;
  stripeTransferId?: string;
}

export interface RealTransactionHistory {
  transactions: RealTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalSales: number;
    totalGrossAmount: number;
    totalCommission: number;
    totalTransactions: number;
    statusCounts: Record<string, number>;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: 'paid' | 'pending' | 'failed';
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch real transaction history from the Transaction model
 */
export const getRealTransactionHistory = async (
  sellerId: string,
  filters: TransactionFilters = {}
): Promise<RealTransactionHistory | null> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate
    } = filters;

    console.log('🔍 [getRealTransactionHistory] Making API call to:', `/transactions/seller/${sellerId}`);
    console.log('🔍 [getRealTransactionHistory] Filters:', filters);

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axiosInstance.get(`/transactions/seller/${sellerId}?${params.toString()}`);
    
    console.log('🔍 [getRealTransactionHistory] API response status:', response.status);
    console.log('🔍 [getRealTransactionHistory] API response data:', response.data);
    
    if (response.status !== 200 || !response.data) {
      console.warn('⚠️ [getRealTransactionHistory] Invalid response or no data');
      return null;
    }

    return response.data as RealTransactionHistory;

  } catch (error: any) {
    console.error('❌ [getRealTransactionHistory] Error fetching transaction history:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.log('📝 [getRealTransactionHistory] No transactions found for this seller');
      return {
        transactions: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false
        },
        summary: {
          totalSales: 0,
          totalGrossAmount: 0,
          totalCommission: 0,
          totalTransactions: 0,
          statusCounts: {}
        }
      };
    }

    handleError(error);
    return null;
  }
};

/**
 * Fetch transaction statistics for charts and analytics
 */
export const getTransactionStats = async (
  sellerId: string,
  period: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<any | null> => {
  try {
    console.log('📊 [getTransactionStats] Fetching stats for seller:', sellerId, 'period:', period);

    const response = await axiosInstance.get(`/transactions/seller/${sellerId}/stats?period=${period}`);
    
    console.log('📊 [getTransactionStats] Stats response:', response.data);
    
    if (response.status !== 200 || !response.data) {
      console.warn('⚠️ [getTransactionStats] Invalid stats response');
      return null;
    }

    return response.data;

  } catch (error: any) {
    console.error('❌ [getTransactionStats] Error fetching transaction stats:', error);
    handleError(error);
    return null;
  }
};

/**
 * Fetch a specific transaction by ID
 */
export const getTransactionById = async (
  transactionId: string
): Promise<RealTransaction | null> => {
  try {
    console.log('🔍 [getTransactionById] Fetching transaction:', transactionId);

    const response = await axiosInstance.get(`/transactions/${transactionId}`);
    
    console.log('🔍 [getTransactionById] Transaction response:', response.data);
    
    if (response.status !== 200 || !response.data) {
      console.warn('⚠️ [getTransactionById] Invalid transaction response');
      return null;
    }

    return response.data as RealTransaction;

  } catch (error: any) {
    console.error('❌ [getTransactionById] Error fetching transaction:', error);
    handleError(error);
    return null;
  }
};
