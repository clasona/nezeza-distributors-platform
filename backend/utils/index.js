const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');
const checkPermission = require('./checkPermission');
const checkWhoIsTheBuyer = require('./checkWhoIsTheBuyer');
const updateOrderFulfillmentStatus = require('./updateFulfillmentStatus');
const cancelFullOrder = require('./cancelOrder');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  updateOrderFulfillmentStatus,
  cancelFullOrder,
  checkWhoIsTheBuyer,
  checkPermission,
};
