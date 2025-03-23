const groupProductsBySeller = (fullOrder) => {
  const subOrders = {};

  fullOrder.orderItems.forEach((item) => {
    const {
      product: productId,
      price,
      title,
      image,
      taxRate,
      taxAmount,
      quantity,
      sellerStoreId,
    } = item;

    // Initialize sub-order object
    if (!subOrders[sellerStoreId]) {
      subOrders[sellerStoreId] = {
        fullOrderId: fullOrder._id,
        sellerStoreId,
        products: [],
        totalAmount: 0,
        totalTax: 0,
        totalShipping: 0,
        transactionFee: 0,
        clientSecret: fullOrder.clientSecret,
        paymentStatus: 'Pending',
        fulfillmentStatus: 'Pending',
        buyerId: fullOrder.buyerId,
        buyerStoreId: fullOrder.buyerStoreId,
      };
    }

    // Add product details to sub-order products list
    subOrders[sellerStoreId].products.push({
      productId,
      quantity,
      taxRate,
      price,
      title,
      image,
    });

    // Calculate and add to the total amount for the seller's sub-order
    subOrders[sellerStoreId].totalAmount += price * quantity;

    // Apply tax and shipping calculations
    const shippingRate = 0; // flat shipping rate per item
    subOrders[sellerStoreId].totalTax += taxAmount;
    subOrders[sellerStoreId].totalShipping += shippingRate * quantity;
  });

  return subOrders;
};

module.exports = {
  groupProductsBySeller,
};
