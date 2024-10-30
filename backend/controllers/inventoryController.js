// models imports
const Inventory = require('../models/Inventory');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
//errors imports
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
//const { checkPermissions } = require('../utils');
/* addProductFromInventory
updateProductInventory 
viewInventory
DeleteProductFromInventory */



const addProductInventory = async (subOrderId) => {
  try {
    // Find the suborder by its ID to confirm it's delivered)
    const subOrder = await SubOrder.findById(subOrderId).populate('products');

    if (!subOrder || subOrder.fulfillmentStatus !== 'Delivered') {
      throw new CustomError.BadRequestError('Order not delivered yet');
    }

    const buyerId = subOrder.buyerId; // Assuming the wholesaler is the buyer
    const buyerStoreId = subOrder.buyerStoreId; 
    const sellerStoreId = subOrder.sellerStoreId;   
    const products = subOrder.products;
    
    for (const product of products) {
      // Check if the product is already in the wholesaler's inventory
      let inventoryItem = await Inventory.find({productId: product.productId});

    
      if (inventoryItem.length < 0) {
        // If the product is already in inventory, update the quantity
        inventoryItem.stock += product.quantity; // Assuming product has a quantity field
        inventoryItem.lastUpdated = Date.now();
      } else {
        // If the product is not in inventory, create a new inventory entry
        const {description, image, seller} = await Product.findById(product.productId);

        inventoryItem = new Inventory({
          owner: buyerId,
          buyerStoreId,
          seller: sellerStoreId,
          description,
          price: 0,
          image,
          productId:product.productId,
          stock: product.quantity,
          averageRating: 0,
          numOfReviews: 0,
          lastUpdated: Date.now(),

        });

      }
      // Save the inventory item (either updated or new)
      await inventoryItem.save();
    }

    return { message: 'Inventory updated successfully' };
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

/*
  Get all inventory items in the inventory 
 */
const viewInventory = async (req, res) => {
    console.log(req.user);
   
    // Fetch all inventory items
    const inventory = await Inventory.find({owner: req.user.userId}).populate('productId', '-price -stock');

    if(!inventory) {
    throw new CustomError.NotFoundError('No inventory items found');
    };

    res.status(StatusCodes.OK).json({ inventory });
          
}


module.exports = {
    addProductInventory,
    viewInventory,
}