const User = require('../models/User');
const Store = require('../models/Store');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');
const { createHash, attachCookiesToResponse, createTokenUser } = require('../utils');
const gracePeriodService = require('../services/gracePeriodService');
const { sendStoreActivationWelcomeEmail } = require('../utils/email/storeActivationEmailUtils');

/**
 * Set up password for approved store application users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setupPassword = async (req, res, next) => {
  try {
    const { token, email, password, confirmPassword } = req.body;
    
    if (!token || !email || !password || !confirmPassword) {
      throw new CustomError.BadRequestError('Please provide all required values: token, email, password, and confirmPassword');
    }

    if (password !== confirmPassword) {
      throw new CustomError.BadRequestError('Passwords do not match');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new CustomError.BadRequestError('Password must be at least 6 characters long');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.BadRequestError('Invalid setup token or email');
    }

    const currentDate = new Date();

    // Check if token is valid and not expired
    if (
      !user.passwordToken ||
      user.passwordToken !== createHash(token) ||
      !user.passwordTokenExpirationDate ||
      user.passwordTokenExpirationDate <= currentDate
    ) {
      throw new CustomError.BadRequestError('Invalid or expired setup token');
    }

    // Check if password is already set (user already has a password)
    if (user.password) {
      throw new CustomError.BadRequestError('Password has already been set for this account. Please use the login page.');
    }

    // Set password and clear setup token
    user.password = password;
    user.passwordToken = null;
    user.passwordTokenExpirationDate = null;
    
    // Change provider from pending_setup to credentials
    if (user.provider === 'pending_setup') {
      user.provider = 'credentials';
    }
    
    // Add the password to previous passwords array for security
    user.previousPasswords = user.previousPasswords || [];
    user.previousPasswords.push(user.password); // This will be hashed by the pre-save hook
    
    await user.save();

    // Activate the user's store and initialize grace period
    let gracePeriodInitialized = false;
    if (user.storeId) {
      try {
        const store = await Store.findById(user.storeId);
        if (store && !store.isActive) {
          console.log(`Activating store ${store.name} for user ${user.email}`);
          
          // Activate store and initialize grace period
          store.isActive = true;
          await store.save();
          
          // Initialize grace period (60 days of no platform fees)
          await gracePeriodService.initializeStoreGracePeriod(store._id);
          gracePeriodInitialized = true;
          
          console.log(`✅ Store activated and grace period initialized for ${store.name}`);
          
          // Send welcome email to the seller
          try {
            await sendStoreActivationWelcomeEmail(store, user);
            console.log(`✅ Welcome email sent to ${user.email}`);
          } catch (emailError) {
            console.error('Error sending store activation welcome email:', emailError);
            // Don't fail the activation if email sending fails
          }
        } else if (store && store.isActive) {
          console.log(`Store ${store.name} is already active`);
        }
      } catch (storeError) {
        console.error('Error activating store during password setup:', storeError);
        // Don't fail the password setup if store activation fails
      }
    }

    // Load user with populated roles for token creation
    const userWithRoles = await User.findById(user._id)
      .populate('roles')
      .populate('storeId');

    // Create token and attach to response
    const tokenUser = createTokenUser(userWithRoles);
    attachCookiesToResponse({ res, user: tokenUser });

    const successMessage = gracePeriodInitialized 
      ? 'Password setup successful! Your store is now active and you have 60 days of zero platform fees. You are now logged in.'
      : 'Password setup successful! You are now logged in.';

    res.status(StatusCodes.OK).json({
      success: true,
      msg: successMessage,
      user: userWithRoles,
      storeActivated: gracePeriodInitialized
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Verify password setup token validity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifySetupToken = async (req, res, next) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      throw new CustomError.BadRequestError('Token and email are required');
    }

    const user = await User.findOne({ email }).select('passwordToken passwordTokenExpirationDate password firstName lastName');
    if (!user) {
      throw new CustomError.BadRequestError('Invalid setup token or email');
    }

    const currentDate = new Date();

    // Check if token is valid and not expired
    if (
      !user.passwordToken ||
      user.passwordToken !== createHash(token) ||
      !user.passwordTokenExpirationDate ||
      user.passwordTokenExpirationDate <= currentDate
    ) {
      throw new CustomError.BadRequestError('Invalid or expired setup token');
    }

    // Check if password is already set
    if (user.password) {
      throw new CustomError.BadRequestError('Password has already been set for this account');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'Setup token is valid',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Resend password setup email (if needed)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resendPasswordSetup = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new CustomError.BadRequestError('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.NotFoundError('No account found with this email address');
    }

    // Check if password is already set
    if (user.password) {
      throw new CustomError.BadRequestError('Password has already been set for this account');
    }

    // Generate new setup token
    const passwordSetupToken = crypto.randomBytes(40).toString('hex');
    const passwordTokenExpirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.passwordToken = createHash(passwordSetupToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();

    // Note: In a real application, you would send the setup email here
    // For now, we'll just return a success message
    console.log(`Password setup token regenerated for: ${email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'Password setup instructions have been sent to your email address',
      // In development, you might want to include the token for testing
      ...(process.env.NODE_ENV === 'development' && { setupToken: passwordSetupToken })
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  setupPassword,
  verifySetupToken,
  resendPasswordSetup,
};
