const Store = require('../models/Store');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const createStore = async (req, res) => {
  const { email, storeName, address, description, storeType, isActive } =
    req.body;

  const emailAlreadyExists = await Store.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const store = await Store.create({
    storeName,
    email,
    address,
    description,
    isActive,
    ownerId: req.user.userId, // Set the user as the owner
    storeType,
    members: [req.user.userId], // Add the user as a member
  });

  const user = await User.findById(req.user.userId)
    .select('-password')
    .populate('roles');
  if (!user) {
    throw new CustomError.UnauthorizedError('Not authorized to create store');
  }
  user.storeId = store._id;
  await user.save();
  res.status(StatusCodes.CREATED).json({ store });
};

const getStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId);
  console.log(user);
  const store = await Store.findById(req.params.id).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }

  if (store._id.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to view this store details.'
    );
  }
  res.status(StatusCodes.OK).json({ store });
};

const updateStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const { email, storeName, address, description } = req.body;
  // if (!email || !storeName || !address || !description) {
  //   throw new CustomError.BadRequestError('Please provide all values');
  // }
  const store = await Store.findById(req.params.id).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }
  if (store._id.toString() !== user.storeId.toString()) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to update this store details.'
    );
  }

  if (storeName) store.email = email;
  if (address) store.address = address;
  if (description) store.description = description;
  if (email) store.storeName = storeName;

  await store.save();

  res.status(StatusCodes.OK).json({ store: store });
};

const deactivateStore = async (req, res) => {
  res.send('Store deactivated');
};

module.exports = {
  createStore,
  getStoreDetails,
  updateStoreDetails,
  deactivateStore,
};
