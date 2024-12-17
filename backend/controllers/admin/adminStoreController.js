const Store = require('../../models/Store');
const User = require('../../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');

const getStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to view store details'
    );
  }
  const { storeId } = req.params;
  //console.log(user.roles);
  const store = await Store.findById(storeId).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ store });
};

const getAllStores = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Unauthorized to view stores');
  }
  const { storeId } = req.params;
  //console.log(user.roles);
  const stores = await Store.find({}).select('-password');
  if (!stores) {
    throw new CustomError.NotFoundError(`No store found.`);
  }
  res.status(StatusCodes.OK).json({ stores });
};

const updateStoreDetails = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  const { email, storeName, address, description } = req.body;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to update the store details'
    );
  }
  const store = await Store.findById(storeId).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }

  if (storeName) store.email = email;
  if (address) store.address = address;
  if (description) store.description = description;
  if (email) store.storeName = storeName;

  await store.save();

  res.status(StatusCodes.OK).json({ store: store });
};

const activateStore = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to activate the store'
    );
  }
  const store = await Store.findByIdAndUpdate(
    storeId,
    { isActive: true },
    { new: true }
  );

  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }

  res.status(StatusCodes.OK).json({ store: store });
};

const deactivateStore = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('roles');
  const { storeId } = req.params;
  if (!user) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
  const isAdmin = user.roles.find((role) => {
    return role.name === 'admin';
  });

  if (!isAdmin) {
    throw new CustomError.UnauthorizedError(
      'Unauthorized to deactivate the store.'
    );
  }
  const store = await Store.findByIdAndUpdate(
    storeId,
    { isActive: false },
    { new: true }
  );

  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${storeId}`);
  }

  res.status(StatusCodes.OK).json({ store: store });
};
module.exports = {
  getStoreDetails,
  getAllStores,
  updateStoreDetails,
  activateStore,
  deactivateStore,
};
