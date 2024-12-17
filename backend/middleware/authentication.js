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
  //const token = req.signedCookies.token;
  // unpack both tokens from cookies and validate them
  const { refreshToken, accessToken } = req.signedCookies;

  // if (!token) {
  //   throw new CustomError.UnauthenticatedError('Authentication Invalid');
  // }

  try {
    // const { name, userId, roles } = isTokenValid({ token });
    // req.user = { name, userId, roles };
    // next();
    // if access token is valid, attach it to the request and go next middleware
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }

    // if refresh token is valid, attach it to the request and go to the next middleware
    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    // if no existing token or the token is not valid, throw an error
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    //attach the existing token to the request and go to the next middleware
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
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
