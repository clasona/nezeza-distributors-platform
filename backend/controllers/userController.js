// model imports
const User = require('../models/User');
const Store = require('../models/Store');

//libraries import
const bcrypt = require('bcryptjs');

// error and status codes imports
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
// utils import
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getSingleUser = async (req, res) => {
  // The authenticated user making the request
  const user = await User.findById(req.params.userId).select('-password').populate('roles').populate('storeId');

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  if(req.user.userId.toString()!== req.params.userId.toString()) {
    throw new CustomError.UnauthorizedError('Sorry, not allow to view this user details.');
  }
 return res.status(StatusCodes.OK).json({ user });

};

// Show current authenticated user details. 
const showCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password').populate('roles').populate('storeId');
  if(!user) {
    throw new CustomError.NotFoundError('No current user found');
  }
  res.status(StatusCodes.OK).json({user});
};

/*
   Update user details.
   User must provide the correct current password to be able to update it.
   
 *  @param req - Express request object  - email, name, roles (array of roles)
 *  @param res - Express response object  - updated user object with updated details 
 */
const updateUser = async (req, res) => {
  const { email, firstName, lastName, } = req.body;

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError('No current user found');
  }
  
  if(req.user.userId.toString()!== req.params.userId.toString()) {
    throw new CustomError.UnauthorizedError('Sorry, update not allowed.');
  }
  if(email) user.email = email;
  if(firstName) user.firstName = firstName;
  if(lastName) user.lastName = lastName;
 
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user });
};

/*
   Update user password.
   User must provide the correct current password to be able to update it.
   This is a basic security measure, you may want to enhance it in a production environment.
   
 *  @param req - Express request object  
   - oldPassword, newPassword
 */
const updateUserPassword = async (req, res) => {
  if(req.user.userId.toString()!== req.params.userId.toString()) {
    throw new CustomError.UnauthorizedError('Sorry, password update not allowed.');
  }
 
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

module.exports = {
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
