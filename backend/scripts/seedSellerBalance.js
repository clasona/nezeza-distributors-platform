const mongoose = require('mongoose');
const path = require('path');

// Load .env file from backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const SellerBalance = require('../models/sellerBalance');
const Store = require('../models/store');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedSellerBalance = async () => {
  try {
    await connectDB();

    // Get all stores to create balance records for
    const stores = await Store.find({});
    
    if (stores.length === 0) {
      console.log('No stores found. Please create some stores first.');
      return;
    }

    console.log(`Found ${stores.length} stores. Creating SellerBalance records...`);

    for (const store of stores) {
      // Check if balance already exists
      const existingBalance = await SellerBalance.findOne({ sellerId: store._id });
      
      if (existingBalance) {
        console.log(`Balance already exists for store: ${store.name}`);
        continue;
      }

      // Create mock balance data
      const mockTotalSales = Math.floor(Math.random() * 10000) + 1000; // $1,000 - $11,000
      const mockCommission = Math.floor(mockTotalSales * 0.05); // 5% commission
      const mockNetRevenue = mockTotalSales - mockCommission;
      const mockPendingBalance = Math.floor(mockNetRevenue * 0.3); // 30% pending
      const mockAvailableBalance = mockNetRevenue - mockPendingBalance; // 70% available

      const balanceData = {
        sellerId: store._id,
        totalSales: mockTotalSales,
        commissionDeducted: mockCommission,
        netRevenue: mockNetRevenue,
        pendingBalance: mockPendingBalance,
        availableBalance: mockAvailableBalance,
        payouts: []
      };

      const newBalance = await SellerBalance.create(balanceData);
      console.log(`Created balance for store "${store.name}":`, {
        storeId: store._id,
        totalSales: mockTotalSales,
        pendingBalance: mockPendingBalance,
        availableBalance: mockAvailableBalance
      });
    }

    console.log('✅ Seller balance seeding completed!');
    
  } catch (error) {
    console.error('Error seeding seller balances:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the script
seedSellerBalance();
