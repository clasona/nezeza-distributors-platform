const groupProductsBySeller = (fullOrder) => {
  const subOrders = {};
  
  // First pass: calculate total amounts per seller
  let totalOrderValue = 0;
  const sellerValues = {};
  
  fullOrder.orderItems.forEach((item) => {
    const itemValue = item.price * item.quantity;
    totalOrderValue += itemValue;
    
    if (!sellerValues[item.sellerStoreId]) {
      sellerValues[item.sellerStoreId] = 0;
    }
    sellerValues[item.sellerStoreId] += itemValue;
  });

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
      // Calculate proportional shipping based on seller's portion of total order value
      const sellerProportion = totalOrderValue > 0 ? (sellerValues[sellerStoreId] / totalOrderValue) : 0;
      const sellerShipping = (fullOrder.totalShipping || 0) * sellerProportion;
      
      subOrders[sellerStoreId] = {
        fullOrderId: fullOrder._id,
        sellerStoreId,
        products: [],
        totalAmount: 0,
        totalTax: 0,
        totalShipping: Math.round(sellerShipping * 100) / 100, // Round to 2 decimal places
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
      image: image[0],
    });

    // Calculate and add to the total amount for the seller's sub-order
    subOrders[sellerStoreId].totalAmount += price * quantity;

    // Add tax amount (already calculated per item)
    subOrders[sellerStoreId].totalTax += taxAmount;
  });

  return subOrders;
};

module.exports = {
  groupProductsBySeller,
};
