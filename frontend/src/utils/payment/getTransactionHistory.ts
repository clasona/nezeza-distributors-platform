import axiosInstance from '../axiosInstance';
import { handleError } from '../errorUtils';

export interface Transaction {
  _id: string;
  type: 'Sale' | 'Payout' | 'Commission' | 'Refund';
  amount: number;
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  orderId?: string;
  transferId?: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  totalCount: number;
  summary: {
    totalSales: number;
    totalPayouts: number;
    totalCommission: number;
  };
}

// For now, this creates mock transaction data based on the seller balance
// In a real implementation, you'd want to track transactions in a separate model
export const getTransactionHistory = async (sellerId: string): Promise<TransactionHistory | null> => {
  try {
    console.log('🔍 [getTransactionHistory] Making API call to:', `/payment/seller-revenue/${sellerId}`);
    // Get seller balance which includes payout history
    const response = await axiosInstance.get(`/payment/seller-revenue/${sellerId}`);
    
    console.log('🔍 [getTransactionHistory] API response status:', response.status);
    console.log('🔍 [getTransactionHistory] API response data:', response.data);
    
    if (response.status !== 200 || !response.data) {
      console.warn('⚠️ [getTransactionHistory] Invalid response or no data');
      return null;
    }

    const { 
      totalSales, 
      availableBalance, 
      pendingBalance, 
      commissionDeducted, 
      payouts = [],
      createdAt 
    } = response.data;

    // Create mock transactions based on the balance data
    const transactions: Transaction[] = [];

    // Add payout transactions from actual data
    payouts.forEach((payout: any, index: number) => {
      transactions.push({
        _id: `payout-${index}`,
        type: 'Payout',
        amount: -Math.abs(payout.amount || payout), // Negative because it's money going out
        description: `Payout to bank account${payout.notes ? ` - ${payout.notes}` : ''}`,
        date: payout.processedAt || payout.date || new Date().toISOString(),
        status: 'Completed',
        transferId: payout.stripeTransferId
      });
    });

    // Add mock sales transactions (in a real app, these would come from orders)
    if (totalSales > 0) {
      // Create a few mock sales entries
      const salesCount = Math.min(10, Math.floor(totalSales / 50)); // Estimate number of sales
      const avgSaleAmount = totalSales / Math.max(salesCount, 1);
      
      for (let i = 0; i < salesCount; i++) {
        const saleAmount = avgSaleAmount * (0.8 + Math.random() * 0.4); // Add some variation
        transactions.push({
          _id: `sale-${i}`,
          type: 'Sale',
          amount: saleAmount,
          description: `Product sale`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
          status: 'Completed',
          orderId: `order-${Date.now()}-${i}`
        });
      }
    }

    // Add commission deduction if any
    if (commissionDeducted > 0) {
      transactions.push({
        _id: 'commission-total',
        type: 'Commission',
        amount: -Math.abs(commissionDeducted), // Negative because it's deducted
        description: 'Platform commission (total)',
        date: createdAt || new Date().toISOString(),
        status: 'Completed'
      });
    }

    // Sort transactions by date (most recent first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const summary = {
      totalSales: totalSales || 0,
      totalPayouts: payouts.reduce((sum: number, payout: any) => sum + (payout.amount || payout), 0),
      totalCommission: commissionDeducted || 0
    };

    return {
      transactions,
      totalCount: transactions.length,
      summary
    };

  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    handleError(error);
    return null;
  }
};
