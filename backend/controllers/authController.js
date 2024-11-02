// model imports 
const User = require('../models/User');
const Token = require('../models/Token');
const Role = require('../models/Role');

// utils imports 
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');
const {
   attachCookiesToResponse, 
   createTokenUser, 
   sendVerificationEmail,
   sendResetPasswordEmail, 
   createHash
  } = require('../utils');

const register = async (req, res) => {
 
  const { email, firstName,lastName, password, businessType} = req.body;
  console.log(req.body);
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

  //console.log(roleNames);
  // fine user roleNames from Role js 
  let roles = await Role.find({ name: { $in: roleNames } });
  
  console.log(roles);

  if (!roles || roles.length === 0) {
    return res.status(StatusCodes.OK).json({ message: 'Please provide valid role(s)' });
  }
  const verificationToken = crypto.randomBytes(40).toString('hex');
  const user = await User.create({ 
    firstName,
    lastName, 
    email, 
    password, 
    roles: roles.map(role => role._id),  // Assign multiple role IDs
    verificationToken, 
    previousPasswords: []  // Initialize previousPasswords array
  });

  // Add the current password to the previousPasswords array
  user.previousPasswords.push(user.password); 
  await user.save();
  const origin = 'http://localhost:3000'; // server where the frontend is running
  // send verification email
  await sendVerificationEmail({ name: user.name, email: user.email, verificationToken, origin });

  //  Create a token for the user and attach it to the response as a cookie
  // we are no longer attaching the token to the response during registration
/*    const tokenUser = createTokenUser(user);
   console.log(tokenUser);
   attachCookiesToResponse({ res, user: tokenUser }); */


  //  Send a verification token to the user while testng in the Postman
  res.status(StatusCodes.CREATED).json({ msg:'Success! Please check your email to verify the account', verificationToken: user.verificationToken });
};

/* 
 Login user.
  User must provide correct email and password to be able to login.
   This is a basic security measure, you may want to enhance it in a production environment.
   
 *  @param req - Express request object  
   - email, password
 */
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
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Account not verified. Please verify your email!');
  }
  const tokenUser = createTokenUser(user);
  // now attach 2 tokens(access token and refresh token) to cookies 
  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user });
    return;
  }
// create new token
  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

 const token = await Token.create(userToken);
 // attach tokens to response
 attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user});
};


/*
 Verify user email.
  User must provide the correct verification token to be able to verify their email.   
 *  @param req - Express request object  
   - verificationToken 
 */
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

/* 
 Logout user.
  User must be authenticated to be able to logout.   
 *  @param req - Express request object  
 *  @param res - Express response object
 */
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  // previous code for logout
  // res.cookie('token', 'logout', {
  //   httpOnly: true,
  //   expires: new Date(Date.now()),
  // });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
/* 
Reset password.
  User must provide a valid email and a password token to be able to reset the password.
   This is a basic security measure, you may want to enhance it in a production environment.
   
 *  @param req - Express request object  
   - email, password, passwordToken
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide a valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    const origin = 'http://localhost:3000'; // server where the frontend is running if it is not on this server
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};

/* 
 Reset password.
  User must provide a valid password token and a new password to be able to reset the password.
   This is a basic security measure, you may want to enhance it in a production environment.
   
 *  @param req - Express request object  
   - token, email, password
 */
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send('reset password');
};



module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
