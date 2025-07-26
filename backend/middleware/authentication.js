const User = require('../models/User');
const Token = require('../models/Token');
const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
} = require('../utils');

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  // Add debugging to understand what's happening
  // console.log('Auth middleware - cookies received:', { 
  //   hasAccessToken: !!accessToken, 
  //   hasRefreshToken: !!refreshToken,
  //   path: req.path 
  // });

  try {
    // if access token is valid, attach it to the request and go next middleware
    if (accessToken) {
      try {
        const payload = isTokenValid(accessToken);
        req.user = payload.user;
        console.log('Auth middleware - access token valid for user:', payload.user.userId);
        return next();
      } catch (error) {
        console.log('Auth middleware - access token invalid, trying refresh token');
        // Access token invalid, try refresh token
      }
    }

    // Check if refresh token exists
    if (!refreshToken) {
      console.log('Auth middleware - no refresh token available');
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    // if refresh token is valid, attach it to the request and go to the next middleware
    const payload = isTokenValid(refreshToken);
    console.log('Auth middleware - refresh token valid for user:', payload.user.userId);

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    
    // if no existing token or the token is not valid, throw an error
    if (!existingToken || !existingToken?.isValid) {
      console.log('Auth middleware - existing token not found or invalid');
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    
    // attach the existing token to the request and go to the next middleware
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    console.log('Auth middleware - refreshed tokens for user:', payload.user.userId);
    next();
  } catch (error) {
    console.log('Auth middleware - authentication failed:', error.message);
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    // Fetch user from database and check if they have the required permission
    const user = await User.findById(req.user.userId).populate('roles'); // req.userId is set after auth
    
    // Collect all permissions from the user's roles
    if (!user || user.roles.length < 1) {
      throw new CustomError.NotFoundError(
        'User not found or no roles assigned.'
      );
    }
    // get all permissions from all roles of the user, flattening the array of arrays into a single array of permissions.
    const userPermissions = user.roles.reduce((permissions, role) => {
      return [...permissions, ...role.permissions];
    }, []);
    //console.log('User permissions:', userPermissions);  // Debugging purposes, can be removed in production
    // Check if the user has at least one of the required permissions
    const hasAnyPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
    // If user does not have any of the required permissions, throw an error
    if (!hasAnyPermission) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route. Insufficient permissions.'
      );
    }
    next(); // Continue to next middleware if permission is granted
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
