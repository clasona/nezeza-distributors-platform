// models imports
const User = require('../models/User');
const WholesalerInventory = require('../models/WholesalerInventory');
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

const createInventory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  console.log(user.storeId);
  const {
    owner,
    buyerStoreId,
    sellerStoreId,
    description,
    price,
    image,
    productId,
    stock,
  } = req.body;

  console.log(buyerStoreId);
  // validate inputs
  if (
    !owner ||
    !buyerStoreId ||
    !sellerStoreId ||
    !description ||
    !price ||
    !image ||
    !productId ||
    !stock
  ) {
    console.log(owner, buyerStoreId, sellerStoreId, description, price, image, productId, stock);
    throw new CustomError.BadRequestError('All fields are required');
  }

  if (user.storeId.toString() !== buyerStoreId) {
    throw new CustomError.UnauthorizedError(
      'You are not authorize to add products in this store.'
    );
  }

  const existingInventory = await WholesalerInventory.findOne({
    productId,
    buyerStoreId: user.storeId,
  });

  console.log(existingInventory);
  // Check if the product already exists in the inventory
  if (existingInventory) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Product already exists in inventory.' });
  }

  // Add the product to the inventory
  const newInventory = await WholesalerInventory.create({
    owner,
    buyerStoreId,
    sellerStoreId,
    description,
    price,
    image,
    productId,
    stock,
  });

  if (!newInventory) {
    throw new CustomError.InternalServerError(
      'Failed to add product to inventory'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Product added to inventory successfully',
    data: newInventory,
  });
};

const updateInventory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  //console.log(req.params);
  const { id: inventoryId } = req.params;
  const { description, price, image, stock } = req.body;
  const inventory = await WholesalerInventory.findById(inventoryId);
  // console.log(inventory.buyerStoreId);
  // console.log(user.storeId);
  if (!user) {
    throw new CustomError.UnauthorizedError('No current user found');
  }
  if (!inventory) {
    throw new CustomError.NotFoundError('Inventory not found');
  }
  //console.log(inventory.sellerStoreId.toString());

  if (inventory.buyerStoreId.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to update this inventory.'
    );
  }

  // Validate inputs
  if (!description && !stock && !price && !image) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message:
        'At least one field (quantity or selling price) must be provided.',
    });
  }

  // Find and update the inventory
  const updatedInventory = await WholesalerInventory.findByIdAndUpdate(
    inventoryId,
    {
      ...(description && { description }),
      ...(stock && { stock }),
      ...(price && { price }),
      ...(image && { image }),
    },
    { new: true }
  );

  if (!updatedInventory) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Inventory not found.' });
  }

  res.status(StatusCodes.OK).json({
    message: 'Inventory updated successfully.',
    inventory: updatedInventory,
  });
};

const deleteInventory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  //console.log(req.params);
  const { id: inventoryId } = req.params;
  const inventory = await WholesalerInventory.findById(inventoryId);
  // console.log(inventory.buyerStoreId);
  // console.log(user.storeId);
  if (!user) {
    throw new CustomError.UnauthorizedError('No current user found');
  }
  if (!inventory) {
    throw new CustomError.NotFoundError('Inventory not found');
  }
  //console.log(inventory.sellerStoreId.toString());
  if (inventory.buyerStoreId.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to delete this inventory.'
    );
  }
  const deletedInventory = await WholesalerInventory.findByIdAndDelete(
    inventoryId
  );

  if (!deletedInventory) {
    throw new CustomError.BadRequestError('Inventory not found.');
  }

  res.status(StatusCodes.OK).json({
    message: 'Inventory deleted successfully.',
    inventory: deletedInventory,
  });
};

const getAllInventory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const { storeId } = req.query; // Store ID for filtering

  // Validate input
  if (!storeId) {
    throw new CustomError.BadRequestError('Store ID is required.');
  }

  if (storeId.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to view inventories.'
    );
  }

  const inventory = await WholesalerInventory.find({ buyerStoreId: storeId });

  res
    .status(StatusCodes.OK)
    .json({ message: 'Inventory retrieved successfully.', inventory });
};

const getSingleInventory = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const { id: inventoryId } = req.params;
  const { storeId } = req.query; // Store ID for filtering
  // const { storeId } = req.user; // the user's store must be already linked
  console.log(user.storeId.toString());
  console.log(storeId);
  console.log(inventoryId);
  if (storeId !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to view this inventory.'
    );
  }
  const inventoryItem = await WholesalerInventory.findById(inventoryId);
  if (!inventoryItem) {
    throw new CustomError.NotFoundError('No inventory items found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Inventory item retrieved successfully.',
    data: inventoryItem,
  });
};

module.exports = {
  createInventory,
  updateInventory,
  deleteInventory,
  getAllInventory,
  getSingleInventory,
};
