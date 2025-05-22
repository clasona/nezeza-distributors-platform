const cancelSingleOrderProduct = async (req, res) => {
  const { id: orderId, itemId: productId } = req.params;
  const userId = req.user.userId;
  const { quantity } = req.body;

  // Find the order
  const order = await Order.findById(orderId);
  if (!order)
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);

  const user = await User.findById(userId);
  if (!user)
    throw new CustomError.UnauthorizedError(`No user with id: ${userId}`);

  // Authorization logic for individual vs seller buyers
  const isIndividualCustomer = !user.storeId;
  if (isIndividualCustomer) {
    if (String(order.buyerId) !== String(userId)) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to update this order'
      );
    }
  } else {
    if (String(order.buyerStoreId) !== String(user.storeId)) {
      throw new CustomError.UnauthorizedError(
        'Not authorized to update this order'
      );
    }
  }

  // Find the specific orderItem inside orderItems[]
  const orderItemIndex = order.orderItems.findIndex(
    (item) => String(item.product._id || item.product) === String(productId)
  );
  if (orderItemIndex === -1) {
    throw new CustomError.NotFoundError(`No order item with id: ${productId}`);
  }

  // Handle: item already cancelled
  if (order.orderItems[orderItemIndex].status === 'Cancelled') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'This order item has already been cancelled.',
      orderItem: order.orderItems[orderItemIndex],
      order,
    });
  }

  // --- For paid orders, do refund first ---
  let refundResult = null;
  if (order.paymentStatus === 'Paid') {
    try {
      refundResult = await processRefundUtil(orderId, productId, quantity);
    } catch (err) {
      console.error('Return/refund error:', err);
      if (err instanceof CustomError) {
        return res.status(err.statusCode || 400).json({ msg: err.message });
      } else {
        return res
          .status(500)
          .json({ msg: 'Refund failed', error: err.message });
      }
    }
  }

  // Now mark the item as cancelled (for both paid and unpaid orders)
  order.orderItems[orderItemIndex].status = 'Cancelled';

  // Update fulfillmentStatus
  const allCancelled = order.orderItems.every(
    (item) => item.status === 'Cancelled'
  );
  order.fulfillmentStatus = allCancelled ? 'Cancelled' : 'Partially Cancelled';

  await order.save();

  res.status(StatusCodes.OK).json({
    msg: 'Order item cancelled successfully',
    fulfillmentStatus: order.fulfillmentStatus,
    orderItem: order.orderItems[orderItemIndex],
    refund: refundResult,
    order,
  });
};
