const Store = require('../models/Store');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const createStore = async(req, res) => {
    const { 
      email, 
      storeName,
      address,
      description,
      bussinessType, 
      isActive,
    } = req.body;

  const emailAlreadyExists = await Store.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
//   const isFirstAccount = (await Store.countDocuments({})) === 0;
//   const role = isFirstAccount ? 'admin' : 'user';

  const store = await Store.create({ 
   storeName, 
   email, 
   address,
   description,
   isActive,
   ownerId: req.user.userId,  // Set the user as the owner
   bussinessType,
   members: [req.user.userId],  // Add the user as a member
  });

  const user = await User.findById(req.user.userId).select('-password').populate('roles');
  user.storeId = store._id;
  await user.save();

  res.status(StatusCodes.CREATED).json({ store });
}

const getStoreDetails = async(req, res) => {
 const store = await Store.findOne({ _id: req.params.id }).select('-password');
  if (!store) {
    throw new CustomError.NotFoundError(`No store with id : ${req.params.id}`);
  }
  //checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ store });
}

const updateStoreDetails = async(req, res) => {
    const { email, storeName } = req.body;
    if (!email || !storeName) {
        throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await Store.findOne({ _id: req.user.userId });
    
    user.email = email;
    user.storeName = storeName;
    
    await user.save();
    
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
       
}

const deactivateStore = async(req, res) => {
    res.send('Store deactivated')
}

module.exports = {
    createStore,
    getStoreDetails,
    updateStoreDetails,
    deactivateStore,

};