const { StatusCodes } = require('http-status-codes');
const Product = require('./models/Product');
const Store = require('./models/Store');

// Controller to get products for a specific manufacturer
const getManufacturerProducts = async (req, res) => {
    const manufacturingStoreUserId = req.user.userId; // assuming `userId` is stored in req.user for the authenticated user
    const store = await User.findOne({_id: manufacturingStoreUserId }).select('storeId');
    if (!store) {
        throw new CustomError.UnauthorizedError('Not authorized to view products');
    }
    // Find products associated only with the logged-in manufacturer
    const products = await Product.find({ storeId: store.storeId });    
    res.status(StatusCodes.OK).json({ products });
  };

  module.exports = {
    getManufacturerProducts,
  };
  