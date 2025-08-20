const { Shippo } = require('shippo');
const SubOrder = require('../../models/SubOrder');
const Store = require('../../models/Store');
const CustomError = require('../../errors');
const {
  sendOrderStatusUpdateEmailAndNotification,
} = require('../sendEmailAndNotification');
const Order = require('../../models/Order');

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_TOKEN,
});

/**
 * Create a shipping label using the rateId stored in the suborder
 * @param {string} subOrderId - The suborder ID
 * @returns {Object} - The shipping label details including tracking number and label URL
 */
const createShippingLabelForSubOrder = async (subOrderId) => {
  try {
    // Find the suborder and get the stored rateId
    const subOrder = await SubOrder.findById(subOrderId)
      .populate('fullOrderId')
      .populate('sellerStoreId');
    
    if (!subOrder) {
      throw new CustomError.NotFoundError(`SubOrder with ID ${subOrderId} not found`);
    }
    
    if (!subOrder.selectedRateId && !subOrder.shippingDetails?.rateId) {
      throw new CustomError.BadRequestError('No shipping rate ID found for this suborder. Customer may not have selected shipping options.');
    }
    
    // Get the rateId from either location
    const rateId = subOrder.selectedRateId || subOrder.shippingDetails?.rateId;
    

    
    // Check if this is a fallback rate (created when real rates weren't available)
    const isFallbackRate = rateId && rateId.startsWith('fallback_');
    
    if (isFallbackRate) {

      // Skip trying to use the fallback rate and go directly to regenerating with complete addresses
      return await createLabelWithCompleteAddresses(subOrderId, subOrder);
    }

    let initialRateDetails = null;
    
    try {
      // First, let's get the rate details to understand what we're working with

      try {
        initialRateDetails = await shippo.rates.get(rateId);

        // Fetch the shipment details to get address and parcel information
        if (initialRateDetails.shipment) {
          const shipmentDetails = await shippo.shipments.get(initialRateDetails.shipment);
          // Debugging output removed; no further action needed here
        }
      } catch (rateGetError) {

      }
      
      // First, try to create the label with the existing rate
      const transaction = await shippo.transactions.create({
        rate: rateId,
        label_file_type: 'PDF',
        async: false,
      });


      if (transaction.status !== 'SUCCESS') {
        const errorMessages = Array.isArray(transaction.messages) 
          ? transaction.messages.map(m => m.text || m.message || m).join(', ')
          : transaction.messages || 'Unknown error';
        throw new Error(`Label creation failed: ${errorMessages}`);
      }
      

      
      // If successful, update suborder and return with rate details
      return await updateSubOrderWithTrackingInfo(subOrderId, subOrder, transaction, initialRateDetails);
      
    } catch (rateError) {

      console.log('Error type:', rateError.constructor.name);
      if (rateError.response) {
        console.log('API Response Status:', rateError.response.status);
        console.log('API Response Data:', JSON.stringify(rateError.response.data, null, 2));
      }
      console.log('=== END INITIAL RATE FAILURE ===\n');
      
      // If the rate fails (likely due to incomplete addresses), regenerate with complete data
      return await createLabelWithCompleteAddresses(subOrderId, subOrder);
    }
    
  } catch (error) {
    console.error('Error creating shipping label:', error);
    throw error;
  }
};

/**
 * Create shipping label with complete addresses (used for fallback rates or failed initial rates)
 */
const createLabelWithCompleteAddresses = async (subOrderId, subOrder) => {
  console.log('Creating label with complete address information...');
  
  // Get complete addresses from the full order and seller store
  const fullOrder = subOrder.fullOrderId;
  const sellerStore = subOrder.sellerStoreId;
  
  if (!fullOrder || !sellerStore || !fullOrder.shippingAddress || !sellerStore.address) {
    throw new CustomError.BadRequestError('Missing complete address information needed for shipping label creation');
  }
  
  // Ensure addresses have all required fields for Shippo
  const customerAddress = validateAndNormalizeAddress(fullOrder.shippingAddress, 'customer');
  const sellerAddress = validateAndNormalizeAddress(sellerStore.address, 'seller');
  
  // console.log('Creating shipment with addresses:', {
  //   from: { city: sellerAddress.city, state: sellerAddress.state },
  //   to: { city: customerAddress.city, state: customerAddress.state }
  // });
  
  // Build parcel from suborder products
  const parcel = buildParcelFromSubOrderItems(subOrder.products);
  // console.log('Parcel details:', parcel);
  
  // Create a new shipment with complete addresses
  const newShipment = await shippo.shipments.create({
    addressFrom: sellerAddress,
    addressTo: customerAddress,
    parcels: [parcel],
    async: false,
  });
  
  if (!newShipment.rates || newShipment.rates.length === 0) {
    throw new CustomError.BadRequestError('No shipping rates available for this shipment with complete addresses');
  }
  
  // console.log(`Found ${newShipment.rates.length} shipping rates`);
  
  // Find the cheapest ground rate (similar to original selection logic)
  const groundRates = newShipment.rates.filter(
    (r) => !/air|express|next day|2nd day|3rd day|overnight|saver/i.test(r.servicelevel.name)
  );
  
  const selectedRate = groundRates.length > 0 ? groundRates[0] : newShipment.rates[0];
  
  // console.log('\n=== COMPARING REGENERATED RATE WITH ORIGINAL ===');
  // console.log('NEW Selected rate details:');
  // console.log('- Rate ID:', selectedRate.objectId);
  // console.log('- Provider:', selectedRate.provider);
  // console.log('- Service Level:', selectedRate.servicelevel?.name);
  // console.log('- Amount:', selectedRate.amount, selectedRate.currency);
  // console.log('- From Address Validation:', selectedRate.shipment?.addressFrom?.validationResults);
  // console.log('- To Address Validation:', selectedRate.shipment?.addressTo?.validationResults);
  // console.log('- Shipment ID:', selectedRate.shipment?.objectId);
  
  // Show all available rates for comparison
  console.log('All available rates in new shipment:');
  newShipment.rates.forEach((rate, index) => {
    console.log(`  ${index + 1}. ${rate.provider} ${rate.servicelevel?.name} - $${rate.amount} (ID: ${rate.objectId})`);
  });
  console.log('=== END RATE COMPARISON ===\n');
  
  // Create label with the new rate
  const newTransaction = await shippo.transactions.create({
    rate: selectedRate.objectId,
    label_file_type: 'PDF',
    async: false,
  });
  
  console.log('\n=== NEW TRANSACTION RESULT ===');
  console.log('- Status:', newTransaction.status);
  console.log('- Tracking Number:', newTransaction.trackingNumber);
  console.log('- Label URL:', newTransaction.labelUrl);
  console.log('- Carrier:', selectedRate.provider); // Use provider from the rate, not transaction
  
  if (newTransaction.status !== 'SUCCESS') {
    const errorMessages = Array.isArray(newTransaction.messages) 
      ? newTransaction.messages.map(m => m.text || m.message || m).join(', ')
      : newTransaction.messages || 'Unknown error';
    console.log('- Error Messages:', errorMessages);
    console.log('=== END NEW TRANSACTION RESULT ===\n');
    throw new Error(`New label creation failed: ${errorMessages}`);
  }
  
  console.log('NEW TRANSACTION SUCCESS!');
  console.log('=== END NEW TRANSACTION RESULT ===\n');
  
  // Update the suborder with the new rateId for future reference
  await SubOrder.findByIdAndUpdate(subOrderId, {
    selectedRateId: selectedRate.objectId
  });
  
  return await updateSubOrderWithTrackingInfo(subOrderId, subOrder, newTransaction, selectedRate);
};

/**
 * Map carrier names from Shippo to valid enum values in SubOrder schema
 */
const mapCarrierName = (carrierName) => {
  if (!carrierName) return 'TBD';
  
  const normalizedCarrier = carrierName.toUpperCase();
  const validCarriers = ['DHL', 'FEDEX', 'UPS', 'USPS', 'OTHER', 'TBD'];
  
  // Direct match
  if (validCarriers.includes(normalizedCarrier)) {
    // Return proper case for FedEx
    if (normalizedCarrier === 'FEDEX') return 'FedEx';
    return normalizedCarrier;
  }
  
  // Handle common variations
  if (normalizedCarrier.includes('FEDEX') || normalizedCarrier.includes('FEDERAL EXPRESS')) {
    return 'FedEx';
  }
  
  // Map unknown or invalid carriers to 'Other'
  return 'Other';
};

/**
 * Update suborder with tracking information
 */
const updateSubOrderWithTrackingInfo = async (subOrderId, subOrder, transaction, rateDetails = null) => {
  // Get carrier from rate details (priority) or fallback to transaction
  const carrierName = rateDetails?.provider || transaction.rate?.provider || 'TBD';
  const mappedCarrier = mapCarrierName(carrierName);
  
  const updateData = {
    'trackingInfo.trackingNumber': transaction.trackingNumber,
    'trackingInfo.labelUrl': transaction.labelUrl,
    'trackingInfo.carrier': mappedCarrier,
    fulfillmentStatus: 'Awaiting Shipment',
  };
  
  // Also update shippingDetails if it exists
  if (subOrder.shippingDetails) {
    updateData['shippingDetails.trackingNumber'] = transaction.trackingNumber;
    updateData['shippingDetails.labelUrl'] = transaction.labelUrl; // Add labelUrl here too
    updateData['shippingDetails.carrier'] = mappedCarrier;
    updateData['shippingDetails.trackingUrl'] = transaction.trackingUrlProvider || '';
    updateData['shippingDetails.shipmentStatus'] = 'Awaiting Shipment';
  }
  
  await SubOrder.findByIdAndUpdate(subOrderId, updateData);
  
  //update fullorder shipping status if needed
  if (subOrder.fullOrderId) {
    await Order.findByIdAndUpdate(subOrder.fullOrderId._id, {
      shippingStatus: 'Awaiting Shipment',
      'shippingDetails.trackingNumber': transaction.trackingNumber,
      'shippingDetails.labelUrl': transaction.labelUrl,
      'shippingDetails.carrier': mappedCarrier,
      'shippingDetails.trackingUrl': transaction.trackingUrlProvider || '',
    });
  }

  // Send notification to customer about label creation and status update
  try {
    // Get store name for context
    const store = subOrder.sellerStoreId;
    const storeName = (store && store.name) ? store.name : `Store ${subOrder.sellerStoreId}`;
    
    await sendOrderStatusUpdateEmailAndNotification({
      buyerId: subOrder.buyerId,
      orderId: subOrderId,
      fullOrderId: subOrder.fullOrderId && subOrder.fullOrderId._id ? subOrder.fullOrderId._id : subOrder.fullOrderId,
      status: 'Awaiting Shipment',
      storeName: storeName,
      trackingInfo: {
        trackingNumber: transaction.trackingNumber,
        carrier: mappedCarrier,
        labelUrl: transaction.labelUrl
      },
      subOrderItems: subOrder.products || []
    });
  } catch (notificationError) {
    console.error('Failed to send shipping label notification:', notificationError);
    // Don't fail the entire operation due to notification failure
  }
  
  return {
    success: true,
    trackingNumber: transaction.trackingNumber,
    labelUrl: transaction.labelUrl,
    carrier: mappedCarrier,
    servicelevel: rateDetails?.servicelevel?.name || transaction.rate?.servicelevel?.name,
    estimatedDays: rateDetails?.estimatedDays || transaction.rate?.estimatedDays,
    trackingUrl: transaction.trackingUrlProvider,
    transaction: transaction,
  };
};

/**
 * Validate and normalize address for Shippo API
 */
const validateAndNormalizeAddress = (address, type) => {
  if (!address) {
    throw new CustomError.BadRequestError(`${type} address is missing`);
  }
  
  // Required fields for Shippo
  const requiredFields = ['street1', 'city', 'state', 'zip', 'country'];
  const missingFields = requiredFields.filter(field => {
    const value = address[field] || address[field === 'street1' ? 'street' : field] || address[field === 'zip' ? 'zipCode' : field];
    return !value || value.trim() === '';
  });
  
  if (missingFields.length > 0) {
    throw new CustomError.BadRequestError(`${type} address missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Normalize the address object for Shippo
  return {
    name: address.name || `${type} Address`,
    street1: address.street1 || address.street,
    street2: address.street2 || '',
    city: address.city,
    state: address.state,
    zip: address.zip || address.zipCode,
    country: address.country || 'US',
    phone: address.phone || '',
    email: address.email || ''
  };
};

/**
 * Build parcel object from suborder items
 */
const buildParcelFromSubOrderItems = (items) => {
  let totalWeight = 0;
  let maxLength = 0, maxWidth = 0, totalHeight = 0;
  
  items.forEach((item) => {
    const quantity = item.quantity || 1;
    totalWeight += (item.weight || 1) * quantity;
    maxLength = Math.max(maxLength, item.length || 6);
    maxWidth = Math.max(maxWidth, item.width || 6);
    totalHeight += (item.height || 4) * quantity;
  });
  
  return {
    length: Math.max(maxLength, 1).toString(),
    width: Math.max(maxWidth, 1).toString(),
    height: Math.max(totalHeight, 1).toString(),
    distanceUnit: 'in', // Fixed: was distance_unit
    weight: Math.max(totalWeight, 0.1).toString(),
    massUnit: 'lb', // Fixed: was mass_unit
  };
};

/**
 * Update suborder status to shipped and add tracking info
 * @param {string} subOrderId - The suborder ID
 * @param {string} trackingNumber - The tracking number
 * @param {string} carrier - The carrier name
 * @returns {Object} - Updated suborder
 */
const markSubOrderAsShipped = async (subOrderId, trackingNumber, carrier) => {
  try {
    const mappedCarrier = mapCarrierName(carrier);
    
    const updateData = {
      fulfillmentStatus: 'Shipped',
      'trackingInfo.trackingNumber': trackingNumber,
      'trackingInfo.carrier': mappedCarrier,
    };
    
    // Get suborder with populated data for notifications
    const subOrder = await SubOrder.findById(subOrderId)
      .populate('buyerId')
      .populate('sellerStoreId');
    
    if (!subOrder) {
      throw new CustomError.NotFoundError(`SubOrder with ID ${subOrderId} not found`);
    }
    
    // Also update shippingDetails if it exists
    if (subOrder.shippingDetails) {
      updateData['shippingDetails.shipmentStatus'] = 'In Transit';
      updateData['shippingDetails.trackingNumber'] = trackingNumber;
      updateData['shippingDetails.carrier'] = mappedCarrier;
    }
    
    const updatedSubOrder = await SubOrder.findByIdAndUpdate(
      subOrderId,
      updateData,
      { new: true }
    );
    
    // Send notification to customer about shipment
    try {
      const storeName = (subOrder.sellerStoreId && subOrder.sellerStoreId.name) 
        ? subOrder.sellerStoreId.name 
        : `Store ${subOrder.sellerStoreId}`;
      
      await sendOrderStatusUpdateEmailAndNotification({
        buyerId: subOrder.buyerId._id || subOrder.buyerId,
        orderId: subOrderId,
        fullOrderId: subOrder.fullOrderId && subOrder.fullOrderId._id ? subOrder.fullOrderId._id : subOrder.fullOrderId,
        status: 'Shipped',
        storeName: storeName,
        trackingInfo: {
          trackingNumber: trackingNumber,
          carrier: mappedCarrier
        },
        subOrderItems: subOrder.products || []
      });
    } catch (notificationError) {
      console.error('Failed to send shipping notification:', notificationError);
      // Don't fail the entire operation due to notification failure
    }
    
    return {
      success: true,
      subOrder: updatedSubOrder,
    };
    
  } catch (error) {
    console.error('Error updating suborder status:', error);
    throw error;
  }
};

/**
 * Get shipping label URL for a suborder (if already created)
 * @param {string} subOrderId - The suborder ID
 * @returns {Object} - Label information
 */
const getShippingLabelForSubOrder = async (subOrderId) => {
  try {
    const subOrder = await SubOrder.findById(subOrderId);
    
    if (!subOrder) {
      throw new CustomError.NotFoundError(`SubOrder with ID ${subOrderId} not found`);
    }
    
    const labelUrl = subOrder.trackingInfo?.labelUrl || subOrder.shippingDetails?.labelUrl;
    const trackingNumber = subOrder.trackingInfo?.trackingNumber || subOrder.shippingDetails?.trackingNumber;
    const carrier = subOrder.trackingInfo?.carrier || subOrder.shippingDetails?.carrier;
    
    if (!labelUrl) {
      return {
        success: false,
        message: 'No shipping label found for this suborder. Create a label first.',
      };
    }
    
    return {
      success: true,
      labelUrl: labelUrl,
      trackingNumber: trackingNumber,
      carrier: carrier,
      status: subOrder.fulfillmentStatus,
    };
    
  } catch (error) {
    console.error('Error retrieving shipping label:', error);
    throw error;
  }
};

module.exports = {
  createShippingLabelForSubOrder,
  markSubOrderAsShipped,
  getShippingLabelForSubOrder,
};
