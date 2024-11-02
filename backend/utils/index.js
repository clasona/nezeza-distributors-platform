const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');
const checkPermission = require('./checkPermission');
const checkWhoIsTheBuyer = require('./checkWhoIsTheBuyer');
const updateOrderFulfillmentStatus = require('./updateFulfillmentStatus');
const cancelFullOrder = require('./cancelOrder');
const sendEmail = require('./sendEmail');
const sendVerificationEmail = require('./sendVerificationEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('./createHash');

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
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
};
