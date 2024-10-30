// models imports
const {addProductInventory} = require('../controllers/inventoryController');

const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

/* 
 Update Order Fulfillment Status
 This function is used to update the fulfillment status of a sub-order and the overall order.
 This function checks if the provided fulfillment status is valid.
 If the status is valid, it updates the order and sub-order records.
 If the status is invalid, it throws a Bad Request error.
 */
const updateOrderFulfillmentStatus = async (res, req, subOrder, order, fulfillmentStatus) => {
      console.log(subOrder)
      if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(fulfillmentStatus)) {
       throw new CustomError.BadRequestError('Invalid fulfillment status');
      }
     
     //update the order and sub-order fulfilment status
      order.fulfillmentStatus = fulfillmentStatus;
      subOrder.fulfillmentStatus = fulfillmentStatus;
      await order.save();
      await subOrder.save();

      // If the order is delivered, update the inventory
    if (subOrder.fulfillmentStatus === 'Delivered') {
        await addProductInventory(subOrder._id);
      }
      res.status(StatusCodes.OK).json({ subOrder, message: 'Fulfillment status updated successfully'});

  };

  module.exports = updateOrderFulfillmentStatus;