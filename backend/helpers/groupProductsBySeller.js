const Product = require("../models/Product");

const groupProductsBySeller = ({ orderItems, selectedShippingOptions }) => {
  const subOrders = {};
  
  // First pass: calculate total amounts per seller
  let totalOrderValue = 0;
  const sellerValues = {};
  
  orderItems.forEach((item) => {
    const itemValue = item.price * item.quantity;
    totalOrderValue += itemValue;
    
    // Extract the actual store ID from the sellerStoreId object
    const storeId = typeof item.sellerStoreId === 'object' && item.sellerStoreId._id 
      ? item.sellerStoreId._id 
      : item.sellerStoreId;
    
    if (!sellerValues[storeId]) {
      sellerValues[storeId] = 0;
    }
    sellerValues[storeId] += itemValue;
  });

  for (const item of orderItems) {
    const {
      product: productId,
      price,
      title,
      image,
      taxRate,
      quantity,
      sellerStoreId,
    } = item;

    // Extract the actual store ID from the sellerStoreId object
    const storeId = typeof sellerStoreId === 'object' && sellerStoreId._id 
      ? sellerStoreId._id 
      : sellerStoreId;

    // Get taxRate from the product object or item itself
    // Handle case where productId is an object (populated) vs string (ID only)
    let productTaxRate = 0;
    if (typeof productId === 'object' && productId.taxRate !== undefined) {
      productTaxRate = productId.taxRate;
    } else if (item.taxRate !== undefined) {
      productTaxRate = item.taxRate;
    } else if (taxRate !== undefined) {
      productTaxRate = taxRate;
    }

    // Calculate tax amount if missing (taxRate is an integer for 8%)
    const calculatedTaxAmount = item.taxAmount || (price * quantity * (productTaxRate / 100));
console.log(`Calculated tax amount for product tax rate ${productTaxRate}: ${calculatedTaxAmount}`);

    // Initialize sub-order object
    if (!subOrders[storeId]) {
      const sellerShippingOption = selectedShippingOptions[storeId];
      const sellerShipping = sellerShippingOption ? (sellerShippingOption.cost || sellerShippingOption.price || 0) : 0;
      const selectedRateId = sellerShippingOption ? 
        (sellerShippingOption.rateId || sellerShippingOption) : null;

        // console.log(`Creating sub-order for store ID: ${storeId}, shipping cost: ${sellerShipping}, selected rate ID: ${selectedRateId}`);
      subOrders[storeId] = {
        sellerStoreId,
        products: [],
        totalAmount: 0,
        totalTax: 0,
        totalShipping: sellerShipping,
        selectedRateId,
        transactionFee: 0,
        paymentStatus: 'Pending',
        fulfillmentStatus: 'Pending',
      };
    }

    // Add product details to sub-order products list
    subOrders[storeId].products.push({
      productId,
      quantity,
      taxRate: productTaxRate, // Use the calculated tax rate instead of the original undefined value
      price,
      title,
      image,
    });

    // Calculate and add to the total amount for the seller's sub-order
    subOrders[storeId].totalAmount += price * quantity;

    // Add calculated tax amount
    subOrders[storeId].taxRate = productTaxRate;
    subOrders[storeId].totalTax += calculatedTaxAmount;

    // console.log('------ Added product to sub-order:')
    // console.log(subOrders[storeId]);

  }

  return subOrders;
};

module.exports = {
  groupProductsBySeller,
};
