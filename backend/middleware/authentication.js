const User = require('../models/User');
const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, roles } = isTokenValid({ token });
    req.user = { name, userId, roles };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {

    // Fetch user from database and check if they have the required permission
    const user = await User.findById(req.user.userId).populate('roles');  // req.userId is set after auth
     
    // Collect all permissions from the user's roles
    if(!user || user.roles.length < 1) {
      throw new CustomError.NotFoundError('User not found or no roles assigned.');
    }
    // get all permissions from all roles of the user, flattening the array of arrays into a single array of permissions. 
  const userPermissions = user.roles.reduce((permissions, role) => {
    return [...permissions, ...role.permissions];
  }, []);

   // Check if the user has at least one of the required permissions
   const hasAnyPermission = requiredPermissions.some(permission => 
    userPermissions.includes(permission)
);
// If user does not have any of the required permissions, throw an error
  if (!hasAnyPermission) {
    throw new CustomError.UnauthorizedError('Unauthorized to access this route. Insufficient permissions.');
  }
    next();  // Continue to next middleware if permission is granted
  
};
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
