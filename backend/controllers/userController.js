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
  const user = await User.findById(req.params.userId)
    .select('-password')
    .populate('roles')
    .populate('storeId');

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  if (req.user.userId.toString() !== req.params.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      'Sorry, not allow to view this user details.'
    );
  }
  return res.status(StatusCodes.OK).json({ user });
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Email parameter is required.' });
    }

    const user = await User.findOne({ email: email })
      .select('-password')
      .populate('roles')
      .populate('storeId');

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No user with email: ${email}` });
    }

    return res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Internal server error.' });
  }
};

// Show current authenticated user details.
const showCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .select('-password')
    .populate('roles')
    .populate('storeId');
  if (!user) {
    throw new CustomError.NotFoundError('No current user found');
  }
  res.status(StatusCodes.OK).json({ user });
};

/*
   Update user details.
   User must provide the correct current password to be able to update it.
   
 *  @param req - Express request object  - email, name, roles (array of roles)
 *  @param res - Express response object  - updated user object with updated details 
 */
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email } = req.params;

  // Accept either userId param or email in the body/query
  let user;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email });
  } else {
    throw new CustomError.BadRequestError('User id or email is required');
  }

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  // Only allow user to update themselves unless admin
  if (req.user.userId !== user.id && !req.user.roles?.includes('admin')) {
    throw new CustomError.UnauthorizedError(
      'Not authorized to update this user.'
    );
  }

  // Update only the fields provided in req.body
  Object.keys(req.body).forEach((key) => {
    // Prevent updating protected fields like _id, password, etc.
    if (
      [
        '_id',
        'password',
        'isVerified',
        'verifiedAt',
        'storeId',
        'createdAt',
        'updatedAt',
      ].includes(key)
    ) {
      return;
    }
    user[key] = req.body[key];
  });

  await user.save();

  // If email changed, refresh session cookie
  if (req.body.email) {
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
  }

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
  if (req.user.userId.toString() !== req.params.userId.toString()) {
    throw new CustomError.UnauthorizedError(
      'Sorry, password update not allowed.'
    );
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
  getUserByEmail,
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
