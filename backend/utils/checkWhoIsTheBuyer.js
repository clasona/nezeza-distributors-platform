
const {statusCodes} = require('http-status-codes');
const CustomError = require('../errors');

const whoIsTheBuyer = (buyerStore, sellerStore) => {
    // Example: if buyer is a wholesaler, they can only buy from manufacturers
    if (buyerStore.bussinessType === 'manufacturing' && sellerStore.bussinessType !== 'manufacturing') {
      throw new CustomError.BadRequestError('Buying is not allow for manufacturers');
    }
  if (buyerStore.bussinessType === 'wholesale' && sellerStore.bussinessType !== 'manufacturing') {
   throw new CustomError.BadRequestError('Wholesalers can only buy from manufacturers');
 }

 // if buyer is a retailer, they can only buy from wholesalers
 if (buyerStore.bussinessType === 'retail' && sellerStore.bussinessType !== 'wholesale') {
   throw new CustomError.BadRequestError('Retailers can only buy from wholesalers');
 }
   
 if (buyerStore.bussinessType === 'customer' && sellerStore.bussinessType !== 'retail') {
    throw new CustomError.UnauthorizedError("Customers can only buy from retailers");
 }

};

module.exports = whoIsTheBuyer;