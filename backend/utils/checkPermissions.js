const User = require('../models/User');
const CustomError = require('../errors');

const chechPermissions = (roles, requestUserId, resourceUserId) => {
  // console.log(requestUser);
  // console.log(resourceUserId);
  // console.log(typeof resourceUserId);

  // Check if the requesting user has the 'owner' role or appropriate permission
  if (roles.includes('admin')) {
    console.log('admin');
    return 'admin';
  } 
  if (roles.includes('owner')) {
    console.log('owner');
    return 'owner';
  } 

  // return user ID if the requesting user is the same as the resource user
  const isRequestingUser = requestUserId.toString() === resourceUserId.toString();
  if (isRequestingUser) {
    return requestUserId;
  } 

// If none of the above conditions are met, return 'unauthorized'
 throw new CustomError.UnauthorizedError('Not authorized to access this route');


};

module.exports = chechPermissions;
