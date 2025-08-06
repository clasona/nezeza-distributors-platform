import { handleError } from '../errorUtils';

export interface SellerAnalyticsData {
  salesMetrics: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  recentSales: Array<{
    date: string;
    amount: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
    image?: string;
  }>;
  orderStatusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    image?: string;
  }>;
  customerMetrics: {
    totalCustomers: number;
    returningCustomers: number;
    newCustomers: number;
    customerGrowth: number;
  };
  paymentMetrics: {
    pendingBalance: number;
    availableBalance: number;
    totalEarnings: number;
    commissionRate: number;
  };
}

import axiosInstance from '../axiosInstance';
import { OrderProps, ProductProps, SubOrderProps } from '../../../type';
import { Order } from '@stripe/stripe-js';

export const fetchSellerAnalytics = async (period: '7d' | '30d' | '90d' = '30d', sellerStoreId?: string): Promise<SellerAnalyticsData> => {
  try {
    // For seller analytics, we need orders where this user is selling (not buying)
    // Based on orderRoutes.js:
    // - /orders/selling gets orders where current user is the seller
    // - /products/all gets all products for the authenticated user
    const [ordersResponse, productsResponse] = await Promise.all([
      axiosInstance.get('/orders/selling'), // Orders where current user is selling
      axiosInstance.get('/products/all')    // Products owned by current user
    ]);

    // console.log('Orders Response:', ordersResponse.data);
    // console.log('Products Response:', productsResponse.data);

    if (ordersResponse.status !== 200 || productsResponse.status !== 200) {
      console.warn('Failed to fetch analytics data, returning mock data');
      return getMockAnalyticsData(period);
    }

    const orders = ordersResponse.data.orders || ordersResponse.data.data || ordersResponse.data || [];
    const products = productsResponse.data.products || productsResponse.data.data || productsResponse.data || [];

    // Handle case where API returns empty or invalid data
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(products) ? products : [];

    // Fetch real payment metrics if sellerStoreId is provided
    let paymentMetrics = null;
    console.log('Fetching payment metrics for sellerStoreId:', sellerStoreId);
    if (sellerStoreId) {
      try {
        paymentMetrics = await fetchSellerBalance(sellerStoreId);
      } catch (error) {
        console.warn('Failed to fetch seller balance, using calculated metrics');
      }
    }

    // Process the data to create analytics
    const analytics = processSellerAnalytics(safeOrders, safeProducts, period, paymentMetrics);
    
    return analytics;
  } catch (error: any) {
    console.warn('Error fetching analytics, returning mock data:', error);
    return getMockAnalyticsData(period);
  }
};

const processSellerAnalytics = (orders: SubOrderProps[], products: ProductProps[], period: string, paymentMetrics?: any): SellerAnalyticsData => {
  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Filter orders by period
  const recentOrders = orders.filter((order: SubOrderProps) => 
    new Date(order.createdAt) >= startDate && order.paymentStatus === 'Paid'
  );

  // Calculate sales metrics
  const totalRevenue = recentOrders.reduce((sum: number, order: SubOrderProps) => sum + order.totalAmount, 0);
  const totalOrders = recentOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate growth (mock data for now - would need historical comparison)
  const revenueGrowth = Math.round((Math.random() - 0.5) * 40); // -20% to +20%
  const ordersGrowth = Math.round((Math.random() - 0.5) * 30); // -15% to +15%

  // Process recent sales trend
  const salesByDate: { [key: string]: { amount: number; count: number } } = {};
  recentOrders.forEach((order: any) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { amount: 0, count: 0 };
    }
    salesByDate[date].amount += order.totalAmount;
    salesByDate[date].count += 1;
  });

  const recentSales = Object.entries(salesByDate)
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      orderCount: data.count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process top products
  const productSales: { [key: string]: { revenue: number; quantity: number; product: any } } = {};
  recentOrders.forEach((order: any) => {
    order.orderItems?.forEach((item: any) => {
      const productId = item.product._id || item.product;
      if (!productSales[productId]) {
        productSales[productId] = { 
          revenue: 0, 
          quantity: 0, 
          product: item.product 
        };
      }
      productSales[productId].revenue += item.price * item.quantity;
      productSales[productId].quantity += item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({
      id,
      name: data.product.name || data.product.title || 'Unknown Product',
      revenue: data.revenue,
      quantity: data.quantity,
      image: data.product.images?.[0] || data.product.image,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Process order status breakdown
  const statusCounts: { [key: string]: number } = {};
  orders.forEach((order: any) => {
    const status = order.fulfillmentStatus || 'Pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const totalOrdersAll = orders.length;
  const orderStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrdersAll > 0 ? Math.round((count / totalOrdersAll) * 100) : 0,
  }));

  // Process low stock products
  const lowStockProducts = products
    .filter((product: any) => product.quantity <= (product.minStock || 10))
    .map((product: any) => ({
      id: product._id,
      name: product.name || product.title,
      currentStock: product.quantity,
      minStock: product.minStock || 10,
      image: product.images?.[0] || product.image,
    }))
    .slice(0, 5);

  // Calculate customer metrics (mock data for now)
  const uniqueCustomers = new Set(recentOrders.map((order: SubOrderProps) => order.buyerId)).size;
  const totalCustomers = uniqueCustomers;
  const returningCustomers = Math.round(totalCustomers * 0.3); // Mock 30% returning
  const newCustomers = totalCustomers - returningCustomers;
  const customerGrowth = Math.round((Math.random() - 0.3) * 25); // -7.5% to +17.5%

  // Use real payment metrics if available, otherwise use calculated/mock data
  let finalPaymentMetrics;
  console.log('Payment Metrics from API:', paymentMetrics);
  if (paymentMetrics) {
    // Use real data from SellerBalance model
    finalPaymentMetrics = {
      pendingBalance: paymentMetrics.pendingBalance || 0,
      availableBalance: paymentMetrics.availableBalance || 0,
      totalEarnings: paymentMetrics.totalEarnings || paymentMetrics.totalSales || totalRevenue,
      commissionRate: paymentMetrics.commissionRate || paymentMetrics.commissionDeducted || 5,
    };
  } else {
    // Use calculated/mock data as fallback
    finalPaymentMetrics = {
      pendingBalance: Math.round(totalRevenue * 0.1), // Mock 10% pending
      availableBalance: Math.round(totalRevenue * 0.7), // Mock 70% available
      totalEarnings: totalRevenue,
      commissionRate: 5, // Mock 5% commission
    };
  }

  return {
    salesMetrics: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueGrowth,
      ordersGrowth,
    },
    recentSales,
    topProducts,
    orderStatusBreakdown,
    lowStockProducts,
    customerMetrics: {
      totalCustomers,
      returningCustomers,
      newCustomers,
      customerGrowth,
    },
    paymentMetrics: finalPaymentMetrics,
  };
};

const getMockAnalyticsData = (period: string): SellerAnalyticsData => {
  const mockSalesData = [
    { date: '2024-01-01', amount: 1250, orderCount: 5 },
    { date: '2024-01-02', amount: 890, orderCount: 3 },
    { date: '2024-01-03', amount: 2100, orderCount: 8 },
    { date: '2024-01-04', amount: 1650, orderCount: 6 },
    { date: '2024-01-05', amount: 3200, orderCount: 12 },
    { date: '2024-01-06', amount: 1800, orderCount: 7 },
    { date: '2024-01-07', amount: 2450, orderCount: 9 },
  ];

  const mockTopProducts = [
    { id: '1', name: 'Handwoven Kente Cloth', revenue: 2450, quantity: 15, image: '/placeholder-product.jpg' },
    { id: '2', name: 'Wooden African Mask', revenue: 1890, quantity: 12, image: '/placeholder-product.jpg' },
    { id: '3', name: 'Beaded Jewelry Set', revenue: 1650, quantity: 22, image: '/placeholder-product.jpg' },
    { id: '4', name: 'Traditional Pottery', revenue: 1200, quantity: 8, image: '/placeholder-product.jpg' },
    { id: '5', name: 'African Print Dress', revenue: 980, quantity: 18, image: '/placeholder-product.jpg' },
  ];

  const mockOrderStatus = [
    { status: 'Delivered', count: 45, percentage: 65 },
    { status: 'Processing', count: 12, percentage: 17 },
    { status: 'Shipped', count: 8, percentage: 12 },
    { status: 'Pending', count: 4, percentage: 6 },
  ];

  const mockLowStock = [
    { id: '1', name: 'Shea Butter Soap', currentStock: 3, minStock: 10, image: '/placeholder-product.jpg' },
    { id: '2', name: 'Coffee Beans', currentStock: 7, minStock: 15, image: '/placeholder-product.jpg' },
  ];

  return {
    salesMetrics: {
      totalRevenue: 12890,
      totalOrders: 69,
      avgOrderValue: 186.8,
      revenueGrowth: 15.3,
      ordersGrowth: 8.2,
    },
    recentSales: mockSalesData,
    topProducts: mockTopProducts,
    orderStatusBreakdown: mockOrderStatus,
    lowStockProducts: mockLowStock,
    customerMetrics: {
      totalCustomers: 42,
      returningCustomers: 18,
      newCustomers: 24,
      customerGrowth: 12.5,
    },
    paymentMetrics: {
      pendingBalance: 1289,
      availableBalance: 8450,
      totalEarnings: 12890,
      commissionRate: 5,
    },
  };
};
export const fetchSellerBalance = async (sellerStoreId: string) => {
  try {
    const response = await axiosInstance.get(`/payment/seller-revenue/${sellerStoreId}`);

    if (response.status !== 200) {
      console.warn('Failed to fetch seller balance, returning mock data');
      return {
        pendingBalance: 1289,
        availableBalance: 8450,
        totalSales: 12890,
        commissionDeducted: 644,
      };
    }

    const {
      pendingBalance, 
      availableBalance, 
      totalSales, 
      commissionDeducted
    } = response.data;

    return {
      pendingBalance,
      availableBalance,
      totalEarnings: totalSales,
      commissionRate: commissionDeducted,
    };
  } catch (error: any) {
    console.warn('Error fetching balance, returning mock data:', error);
    // Return mock data if API fails
    return {
      pendingBalance: 1289,
      availableBalance: 8450,
      totalSales: 12890,
      commissionDeducted: 644,
    };
  }
};
