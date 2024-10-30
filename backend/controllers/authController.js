// model imports 
const User = require('../models/User');
const Role = require('../models/Role');

// utils imports 
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
// libraries imports
const bcrypt = require('bcryptjs');
const register = async (req, res) => {
 
  const { email, firstName, lastName, password, businessType} = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }
  
  
  // first registered user is an admin
  ///const isFirstAccount = (await Store.countDocuments({})) === 0;
  //const {businessType } = await Store.findById(storeId);
  
  //   const role = isFirstAccount ? 'admin' : 'user';
  let roleNames = [];
  switch (businessType) {
      case 'E-commerce Marketplace':
        roleNames[0] = 'admin';
        break;
      case 'manufacturing':
        roleNames[0] = 'owner';
        roleNames[1] = 'manufacturer';
        break;
      case 'wholesale':
        roleNames[0] = 'owner';
        roleNames[1] = 'wholesaler';
        break;
      case 'retail':
        roleNames[0] = 'owner';
        roleNames[1] = 'retailer';
        break;
      case 'retailer':
        roleNames[0] = 'owner';
        roleNames[1] = 'retailer';
        break;
      default:
        case 'user':
        roleNames[0] = 'customer';
  }

  console.log(roleNames);
  // fine user roleNames from Role js 
  let roles = await Role.find({ name: { $in: roleNames } });
  
  console.log(roles);

  if (!roles || roles.length === 0) {
    return res.status(StatusCodes.OK).json({ message: 'Please provide valid role(s)' });
  }
  const user = await User.create({ 
    firstName,
    lastName, 
    email, 
    password, 
    roles: roles.map(role => role._id),  // Assign multiple role IDs
  });

  // Add the current password to the previousPasswords array
  user.previousPasswords.push(user.password); 
  await user.save();
    // const userStore = await Store.findOne({storeId});
    //  userStore.ownerId = user._id; // Set the user as the owner of the store
    //  userStore.members.push(user._id); // Add the user as a member to the store
     // save to database
     //await user.save();
    // await userStore.save();
     

   // If no store found, create a new one for the user
    //  if(!userStore){
    //    // Create the store with the user as the owner
    //    const store = await Store.create({
    //       name: 'Default Store', 
    //       ownerId: user._id, // Set the user as the owner
    //       storeId, // Set the store type
    //       members: [user._id]  // Add the user as a member
    //     });
        //user.storeId = store._id; // Set the store ID on the user
        
       
        // If a store was found, assign it to the user
        // user.storeId = userStore._id; // Set the store ID on the user
        // user.previousPasswords.push(user.password); // Add the user's current password to the previousPasswords array
        // 
      
      

  //  Create a token for the user and attach it to the response as a cookie
   const tokenUser = createTokenUser(user);
   console.log(tokenUser);
   attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user });
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email }).populate('roles').populate('storeId');
  //console.log(user);
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};


module.exports = {
  register,
  login,
  logout,
};
