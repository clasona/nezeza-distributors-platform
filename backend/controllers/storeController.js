const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const createStore = async (req, res, next) => {
  const { name, email, address, description, storeType, isActive, ownerId } =
    req.body;
  try {
    const emailAlreadyExists = await Store.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError('Email already exists');
    }
    let actualOwnerId = ownerId;
    // Check if the owner exists
    if (!ownerId) {
      // If ownerId is not provided, use logged-in user id
      console.log('OwnerId not provided, using logged in user id...');
      actualOwnerId = req.user.userId;
    } else {
      console.log('OwnerId provided.');
    }

    const store = await Store.create({
      name,
      email,
      address,
      description,
      isActive,
      ownerId: actualOwnerId, // Set the user as the owner
      storeType,
      members: [actualOwnerId], // Add the user as a member
    });

    const user = await User.findById(actualOwnerId)
      .select('-password')
      .populate('roles');
    if (!user) {
      throw new CustomError.UnauthorizedError('Not authorized to create store');
    }
    res.locals.store = store; // used when approving/declining store application

    // Check if a response has already been sent
    if (!req.skipResponse) {
      user.storeId = store._id;
      await user.save();
      res.status(StatusCodes.CREATED).json({ store });
    } else {
      user.storeId = store._id;
      await user.save();
    }
  } catch (error) {
    next(error);
  }
};

const getStoreDetails = async (req, res) => {
  // const user = await User.findById(req.user.userId);
  const store = await Store.findById(req.params.id).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }

  // if (store._id.toString() !== user.storeId.toString()) {
  //   throw new CustomError.UnauthorizedError(
  //     'You are not authorized to view this store details.'
  //   );
  // }
  res.status(StatusCodes.OK).json({ store });
};

const updateStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const { 
    email, 
    name, 
    address, 
    description, 
    category, 
    logo, 
    phone, 
    registrationNumber, 
    storeType 
  } = req.body;
  
  const store = await Store.findById(req.params.id).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }
  if (store._id.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to update this store details.'
    );
  }

  // Update fields only if they are provided
  if (email !== undefined) store.email = email;
  if (name !== undefined) store.name = name;
  if (address !== undefined) store.address = address;
  if (description !== undefined) store.description = description;
  if (category !== undefined) store.category = category;
  if (logo !== undefined) store.logo = logo;
  if (phone !== undefined) store.phone = phone;
  if (registrationNumber !== undefined) store.registrationNumber = registrationNumber;
  if (storeType !== undefined) store.storeType = storeType;

  await store.save();

  res.status(StatusCodes.OK).json({ store: store });
};

const getStoreProducts = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    
    // First check if the store exists
    const store = await Store.findById(storeId);
    if (!store) {
      throw new CustomError.NotFoundError(`No store with id: ${storeId}`);
    }

    // Get all products for this store and populate the storeId field
    const products = await Product.find({ storeId })
      .populate('storeId', 'name email storeType')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(StatusCodes.OK).json({ 
      products,
      count: products.length,
      store: {
        _id: store._id,
        name: store.name,
        storeType: store.storeType
      }
    });
  } catch (error) {
    throw error;
  }
};

const deactivateStore = async (req, res) => {
  res.send('Store deactivated');
};

module.exports = {
  createStore,
  getStoreDetails,
  updateStoreDetails,
  getStoreProducts,
  deactivateStore,
};
