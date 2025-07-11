// import mongoose from 'mongoose';
// import { updateOrderItem } from '../controllers/orderController';
// import { Model } from './yourModel'; // Import your Mongoose model
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

const documentId = '67b54a24da985d733c635f7b'; // Replace with actual ID
const MONGO_URI =
  'mongodb+srv://ysemanag:test123*@nezezacluster.zficx.mongodb.net/';

// async function deleteDocumentById() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('Connected to MongoDB');

//     const result = await Order.findByIdAndDelete(documentId);

//     if (!result) {
//       console.log('Document not found.');
//     } else {
//       console.log('Document deleted successfully:', result);
//     }
//   } catch (error) {
//     console.error('Error deleting document:', error);
//   } finally {
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   }
// }
// deleteDocumentById();

// async function deleteManyDocuments() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('Connected to MongoDB');

//     // Define your filter condition (e.g., delete documents created today)
//     const startOfDay = new Date('2025-02-21T00:00:00.000Z');
//     const endOfDay = new Date('2025-02-22T00:00:00.000Z');

//     const result = await Order.deleteMany({
//       createdAt: { $gte: startOfDay, $lt: endOfDay },
//     });

//     console.log(`Deleted ${result.deletedCount} documents.`);
//   } catch (error) {
//     console.error('Error deleting documents:', error);
//   } finally {
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   }
// }

async function deleteManyDocuments() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Define your filter condition (delete orders after 2025-02-20)
    const cutoffDate = new Date('2025-02-19T23:59:59.999Z'); // Include the last millisecond of the 20th to ensure full coverage.

    const result = await Cart.deleteMany({
      createdAt: { $gt: cutoffDate },
    });

    console.log(`Deleted ${result.deletedCount} documents.`);
  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteManyDocuments();
