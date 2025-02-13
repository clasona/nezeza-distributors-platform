const { statusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const whoIsTheBuyer = (buyerStore, sellerStore) => {
  // Example: if buyer is a wholesaler, they can only buy from manufacturers
  if (
    buyerStore.businessType === 'manufacturing' &&
    sellerStore.businessType !== 'manufacturing'
  ) {
    throw new CustomError.BadRequestError(
      'Buying is not allow for manufacturers'
    );
  }
  if (
    buyerStore.businessType === 'wholesale' &&
    sellerStore.businessType !== 'manufacturing'
  ) {
    throw new CustomError.BadRequestError(
      'Wholesalers can only buy from manufacturers'
    );
  }

  // if buyer is a retailer, they can only buy from wholesalers
  if (
    buyerStore.businessType === 'retail' &&
    sellerStore.businessType !== 'wholesale'
  ) {
    throw new CustomError.BadRequestError(
      'Retailers can only buy from wholesalers'
    );
  }

  if (
    buyerStore.businessType === 'customer' &&
    sellerStore.businessType !== 'retail'
  ) {
    throw new CustomError.UnauthorizedError(
      'Customers can only buy from retailers'
    );
  }
};

module.exports = whoIsTheBuyer;
