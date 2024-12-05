const User = require('../models/User');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getAllUsers = async (req, res) => {
  // The authenticated user making the request
  const allUsers = await User.find({ _id: { $ne: req.user.userId } })
    .select('-password')
    .populate('roles');
  if (!allUsers || allUsers.length === 0) {
    throw new CustomError.NotFoundError(
      'No users found on the platform at the moment'
    );
  }
  return res.status(StatusCodes.OK).json({ allUsers, count: allUsers.length });
};

/* 
   Admin get user details.
   *  @param req - Express request object  - userId
   *  @param res - Express response object  - user object with details  - roles, storeId, etc.  - password is omitted
  */

const getSingleUser = async (req, res) => {
  // The authenticated user making the request
  const user = await User.findById(req.params.userId)
    .select('-password')
    .populate('roles')
    .populate('storeId');

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  return res.status(StatusCodes.OK).json({ user });
};

/*
   Update user details.
   User must provide the correct current password to be able to update it.
   
 *  @param req - Express request object  - email, name, roles (array of roles)
 *  @param res - Express response object  - updated user object with updated details 
 */
const updateUser = async (req, res) => {
  const { email, firstName, lastName, phone, address, status, role, storeId } =
    req.body;

  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new CustomError.NotFoundError('No current user found');
  }
  // user must be admin to update any user's details
  if (email) user.email = email;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (status) user.status = status;
  if (role) user.role = role;
  if (storeId) user.storeId = storeId;

  await user.save();
  res.status(StatusCodes.OK).json({ user });
};

const deleteUser = async (req, res) => {
  // The authenticated user making the request
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  return res.status(StatusCodes.OK).json({ user });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
