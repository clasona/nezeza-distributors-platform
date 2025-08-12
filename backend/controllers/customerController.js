const User = require('../models/User');
const SubOrder = require('../models/SubOrder');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Get all unique customers for a seller based on SubOrders
const getCustomersForSeller = async (req, res, next) => {
  try {
    const sellerStoreId = req.params.storeId;
    // Find all suborders for this seller
    const subOrders = await SubOrder.find({ sellerStoreId });
    const buyerIds = [...new Set(subOrders.map(so => so.buyerId.toString()))];
    // Fetch user details for these buyers
    const customers = await User.find({ _id: { $in: buyerIds } });

    // For each customer, gather their products ordered from this seller
    const customersWithProducts = customers.map(customer => {
      // Find suborders for this customer
      const customerSubOrders = subOrders.filter(so => so.buyerId.toString() === customer._id.toString());
      // Gather products from all suborders
      const productsOrdered = customerSubOrders.flatMap(so => so.products);
      return {
        ...customer.toObject(),
        productsOrdered,
        subOrders: customerSubOrders.map(so => ({
          _id: so._id,
          products: so.products,
          createdAt: so.createdAt,
          fulfillmentStatus: so.fulfillmentStatus
        }))
      };
    });

    res.status(StatusCodes.OK).json({ customers: customersWithProducts });
  } catch (error) {
    next(error);
  }
};

// Get a single customer by ID
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      throw new CustomError.NotFoundError('Customer not found');
    }
    res.status(StatusCodes.OK).json({ customer });
  } catch (error) {
    next(error);
  }
};

// Add more customer-related actions as needed

module.exports = {
  getCustomersForSeller,
  getCustomerById,
};
