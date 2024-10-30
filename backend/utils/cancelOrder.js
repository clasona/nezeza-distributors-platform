// model imports
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
//error imports
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const cancelFullOrder = async (req, res, subOrders, order, cancelOrder) => {
      const userId = req.user.userId;
   
      // If the order has already been shipped/fulfilled, cancellation will not be allowed
      const shippedSuborders = subOrders.filter((subOrder) => {
            return subOrder.fulfillmentStatus === 'Delivered';
      })


      console.log(shippedSuborders)

      if (shippedSuborders.length > 0) {
        throw new CustomError.NotFoundError('Order cannot be canceled as some items have already been shipped or delivered');
      }

      const subOrder = subOrders.find((subOrder) => { 
        if(subOrder.buyer._id.toString() === userId){
            subOrder.fulfillmentStatus = cancelOrder;
          return subOrder;
        }
});
    await subOrder.save();

      //order.subOrders = subOrders;
      order.fulfillmentStatus = cancelOrder;
      await order.save();   
      res.status(StatusCodes.OK).json({ message: 'Order canceled successfully', order });
    
  };

  module.exports = cancelFullOrder;
  