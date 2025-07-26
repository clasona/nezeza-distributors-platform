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
  createHash,
} = require('../utils');
const {
  errorLoggingMiddleware,
} = require('../controllers/admin/adminSystemMonitoringController');

const register = async (req, res, next) => {
  const { firstName, lastName, email, password, storeType } = req.body;
  try {
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError('Email already exists');
    }

    // first registered user is an admin
    ///const isFirstAccount = (await Store.countDocuments({})) === 0;
    //const {storeType } = await Store.findById(storeId);

    //   const role = isFirstAccount ? 'admin' : 'user';
    let roleNames = [];

    switch (storeType) {
      case 'admin':
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
        // roleNames[0] = 'owner';
        roleNames[0] = 'customer';
    }

    //console.log(roleNames);
    // fine user roleNames from Role js
    let roles = await Role.find({ name: { $in: roleNames } });

    if (!roles || roles.length === 0) {
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Please provide valid role(s)' });
    }
    const verificationToken = crypto.randomBytes(40).toString('hex');
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      roles: roles.map((role) => role._id), // Assign multiple role IDs
      verificationToken,
      previousPasswords: [], // Initialize previousPasswords array
      provider: 'credentials', 
    }); 

    // Add the current password to the previousPasswords array
    user.previousPasswords.push(user.password);
    await user.save();
    const origin = process.env.CLIENT_URL;

    // send verification email
    await sendVerificationEmail({
      name: user.firstName,
      email: user.email,
      verificationToken,
      origin,
    });

    //  Create a token for the user and attach it to the response as a cookie
    // we are no longer attaching the token to the response during registration
    /*    const tokenUser = createTokenUser(user);
     console.log(tokenUser);
     attachCookiesToResponse({ res, user: tokenUser }); */

    res.locals.user = user; // used when approving/declining store application

    // Check if a response has already been sent
    if (!req.skipResponse) {
      res.status(StatusCodes.CREATED).json({
        msg: 'Success! Please check your email to verify the account',
        verificationToken: user.verificationToken,
      });
    }
  } catch (error) {
    next(error);
  }
};

const registerGoogle = async (req, res, next) => {
  const { firstName, lastName, email, storeType } = req.body;
  try {
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError('Email already exists');
    }

    let roleNames = [];

    switch (storeType) {
      case 'admin':
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
      case undefined:
        roleNames[0] = 'customer';
    }

    let roles = await Role.find({ name: { $in: roleNames } });

    if (!roles || roles.length === 0) {
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Please provide valid role(s)' });
    }

    // No password/verificationToken for Google registration
    const user = await User.create({
      firstName,
      lastName,
      email,
      roles: roles.map((role) => role._id), // Assign multiple role IDs
      isVerified: true, // Mark as verified
      provider: 'google', // Track that this user registered with Google
      previousPasswords: [], // No password for Google user
    });

    res.locals.user = user;

    if (!req.skipResponse) {
      res.status(StatusCodes.CREATED).json({
        msg: 'Success! Google account registered.',
      });
    }
  } catch (error) {
    next(error);
  }
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
  const user = await User.findOne({ email })
    .populate('roles')
    .populate('storeId');
  //console.log(user);
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError(
      'Account not verified. Please verify your email!'
    );
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

  res.status(StatusCodes.OK).json({ user });
};

const loginGoogle = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError('Please provide email');
  }

  const user = await User.findOne({ email })
    .populate('roles')
    .populate('storeId');

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  // Optionally: check provider
  if (user.provider !== 'google') {
    throw new CustomError.UnauthenticatedError('Not a Google account');
  }

  // Optionally: check isVerified (for Google users you may set this on registration)
  if (!user.isVerified && !user.isEmailVerified) {
    throw new CustomError.UnauthenticatedError(
      'Account not verified. Please verify your email!'
    );
  }

  const tokenUser = createTokenUser(user);

  // now attach 2 tokens (access token and refresh token) to cookies
  let refreshToken = '';
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

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user });
};

/*
 Verify user email.
  User must provide the correct verification token to be able to verify their email.   
 *  @param req - Express request object  
   - verificationToken 
 */
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  console.log(verificationToken, email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, msg: 'Verification Failed: User not found' });
    }

    if (user.verificationToken !== verificationToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, msg: 'Verification Failed: Invalid token' });
    }

    (user.isVerified = true), (user.verified = Date.now());
    user.verificationToken = '';

    await user.save();

    res.status(StatusCodes.OK).json({ success: true, msg: 'Email Verified' });
  } catch (error) {
    errorLoggingMiddleware(error);
    console.error('Verification error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Verification Failed: Internal server error',
    });
  }
};

/*
 Check user email is verified
  User must provide the correct verification token to be able to verify their email.   
 *  @param req - Express request object  
   - verificationToken 
 */
const checkUserVerified = async (req, res) => {
  const { email } = req.query; // Assuming email is sent as a query parameter

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ verified: false, msg: 'User not found' });
    }

    return res
      .status(StatusCodes.OK)
      .json({ verified: user.isVerified, msg: 'Verification status checked' });
  } catch (error) {
    errorLoggingMiddleware(error, req, res);
    console.error('Error checking verification status:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ verified: false, msg: 'Internal server error' });
  }
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
    const origin = process.env.CLIENT_URL;
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
  registerGoogle,
  login,
  loginGoogle,
  logout,
  verifyEmail,
  checkUserVerified,
  forgotPassword,
  resetPassword,
};
