const axios = require('axios');
require('dotenv').config();
const { Shippo } = require('shippo');

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_TOKEN,
});

// ---------- HELPERS ----------
function addressToString(address) {
  return `${address.street1 || address.street}, ${address.city}, ${
    address.state
  } ${address.zipCode || address.zip}, ${address.country || 'US'}`;
}

async function geocodeAddress(address) {
  try {
    const fullAddress = addressToString(address);
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          country: address.country || 'US',
          limit: 1,
          types: 'address',
        },
      }
    );
    if (response.data.features && response.data.features.length > 0) {
      const result = response.data.features[0];
      const [lng, lat] = result.center;
      return {
        lat,
        lng,
        formatted_address: result.place_name,
        place_id: result.id,
        address_components: result.context || [],
        bbox: result.bbox,
        relevance: result.relevance,
      };
    } else {
      console.error('Geocoding failed: No results found');
      return null;
    }
  } catch (error) {
    console.error(
      'Geocoding API error:',
      error.response?.data || error.message
    );
    return null;
  }
}

function convertAddressFormat(address) {
  const streetAddress = [address.street1 || address.street];
  return JSON.stringify({
    street_address: streetAddress,
    city: address.city,
    state: address.state,
    zip_code: address.zipCode || address.zip,
    country: address.country,
  });
}

function groupItemsBySeller(cartItems) {
  const itemsBySeller = {};
  cartItems.forEach((item) => {
    const sellerId =
      item.sellerStoreId?._id ||
      item.sellerId || // fallback for your previous structure
      (item.storeId && item.storeId._id) ||
      item.storeId;
    if (!sellerId) return;
    if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
    itemsBySeller[sellerId].push(item);
  });
  return itemsBySeller;
}

function calculateDeliveryDate(estimatedDays) {
  if (!estimatedDays) return null;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  return deliveryDate.toISOString().split('T')[0];
}

function calculateSameDayDeliveryTime() {
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  return deliveryTime.toISOString().split('T')[0];
}

function formatDateLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function buildParcelFromItems(items) {
  let totalWeight = 0;
  let maxLength = 0,
    maxWidth = 0,
    totalHeight = 0;
  items.forEach((item) => {
    const quantity = item.quantity || 1;
    totalWeight +=
      (item.weight || (item.product && item.product.weight) || 1) * quantity;
    maxLength = Math.max(
      maxLength,
      item.length || (item.product && item.product.length) || 6
    );
    maxWidth = Math.max(
      maxWidth,
      item.width || (item.product && item.product.width) || 6
    );
    totalHeight +=
      (item.height || (item.product && item.product.height) || 4) * quantity;
  });
  return {
    length: maxLength.toString(),
    width: maxWidth.toString(),
    height: totalHeight.toString(),
    distanceUnit: 'in',
    weight: totalWeight.toString(),
    massUnit: 'lb',
  };
}

async function getUberAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.UBER_CLIENT_ID);
    params.append('client_secret', process.env.UBER_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'eats.deliveries');
    const response = await axios.post(
      'https://login.uber.com/oauth/v2/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Uber Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to get Uber access token');
  }
}

async function isSameDayServiceableWithAddresses(
  originAddress,
  destinationAddress
) {
  try {
    const originCoords = await geocodeAddress(originAddress);
    const destCoords = await geocodeAddress(destinationAddress);
    if (!originCoords || !destCoords) return false;
    const origin = `${originCoords.lng},${originCoords.lat}`;
    const destination = `${destCoords.lng},${destCoords.lat}`;
    return await isSameDayServiceable(origin, destination);
  } catch (error) {
    console.error('Address-based distance calculation error:', error);
    return false;
  }
}

async function isSameDayServiceable(origin, destination) {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          geometries: 'geojson',
          overview: 'false',
        },
      }
    );
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceInMeters = route.distance;
      const distanceInMiles = distanceInMeters * 0.000621371;
      return distanceInMiles <= 10;
    } else {
      return false;
    }
  } catch (error) {
    console.error(
      'Distance calculation error:',
      error.response?.data || error.message
    );
    return false;
  }
}

// ---------- MAIN CONTROLLER ----------

// Import address validation utility
const { validateAddressWithShippo, normalizeAddress } = require('../utils/address/validateAddress');

const getShippingOptions = async (req, res) => {
  const { cartItems, customerAddress } = req.body;

  try {
    // Validate customerAddress has required fields
    if (!customerAddress) {
      console.error('ERROR: customerAddress is missing entirely');
      return res.status(400).json({
        success: false,
        error: 'Customer address is required',
        shippingGroups: [],
      });
    }
    
    // Set default country if missing
    if (!customerAddress.country || customerAddress.country.trim() === '') {
      console.warn('Missing or empty country in customerAddress, defaulting to US');
      customerAddress.country = 'US';
    }
    
    // STRICT ADDRESS VALIDATION: Validate customer address with Shippo
    // This ensures we only calculate rates with complete, valid addresses
    let validatedCustomerAddress;
    try {
      console.log('Validating customer address with Shippo...');
      validatedCustomerAddress = await validateAddressWithShippo(customerAddress, 'shipping');
      console.log('Customer address validated successfully');
    } catch (addressError) {
      console.error('Customer address validation failed:', addressError.message);
      return res.status(400).json({
        success: false,
        error: `Invalid shipping address: ${addressError.message}`,
        shippingGroups: [],
        addressValidationError: true // Flag for frontend to handle appropriately
      });
    }
    
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No cart items provided',
        shippingGroups: [],
      });
    }

    const itemsBySeller = groupItemsBySeller(cartItems);
    // console.log('Items grouped by seller:', JSON.stringify(itemsBySeller, null, 2));

    const standardRatesObj = {};
    const sameDayRatesObj = {};

    // Loop over each seller group
    for (const sellerId in itemsBySeller) {
      const items = itemsBySeller[sellerId];
      // Get seller address from first item in group
      const sellerAddress =
        items[0].sellerAddress ||
        (items[0].sellerStoreId && items[0].sellerStoreId.address);
      
      // console.log(`Seller ${sellerId} address:`, JSON.stringify(sellerAddress, null, 2));

      // FALLBACK STRATEGY #1: Missing Seller Address
      // When seller address data is missing from cart items, we can't call external APIs (Shippo/Uber)
      // Instead of failing, we provide reasonable default shipping options to keep checkout flow working
      if (!sellerAddress) {
        console.warn(`Missing seller address for seller ${sellerId}. Using fallback rates.`);
        
        // FALLBACK OPTION SELECTION RATIONALE:
        // These rates are chosen to be competitive yet profitable:
        // - Standard ($5.99, 5-7 days): Covers basic ground shipping costs, appeals to price-conscious customers
        // - Express ($12.99, 2-3 days): Premium option for faster delivery, higher margin
        // - Prices are based on average US shipping costs and market research
        // - Delivery times are conservative estimates to manage customer expectations
        standardRatesObj[sellerId] = [
          {
            rateId: `fallback_standard_${sellerId}`, // Unique ID for tracking
            seller: sellerId,
            price: 5.99, // Competitive standard shipping rate
            type: 'standard',
            provider: 'Standard Shipping',
            servicelevel: 'Ground',
            estimatedDays: 5, // Conservative estimate
            durationTerms: '5-7 business days',
            deliveryTime: calculateDeliveryDate(5),
            items
          },
          {
            rateId: `fallback_fast_${sellerId}`,
            seller: sellerId,
            price: 12.99, // Premium pricing for express service
            type: 'standard',
            provider: 'Express Shipping',
            servicelevel: 'Express',
            estimatedDays: 2, // Faster delivery expectation
            durationTerms: '2-3 business days',
            deliveryTime: calculateDeliveryDate(2),
            items
          }
        ];
        // No same-day delivery when address is missing (can't calculate distance/feasibility)
        sameDayRatesObj[sellerId] = { error: 'Same-day not available' };
        continue;
      }

      // Standard Shipping (Shippo) with fallback - use validated customer address
      try {
        // Extract the actual address from the validation result
        const customerAddressForShippo = validatedCustomerAddress.address || validatedCustomerAddress;
        
        // CRITICAL: Also validate seller address to ensure complete rate information
        let validatedSellerAddress;
        try {
          console.log('Validating seller address with Shippo...');
          validatedSellerAddress = await validateAddressWithShippo(sellerAddress, 'shipping');
          console.log('Seller address validated successfully');
        } catch (sellerAddressError) {
          console.warn(`Seller address validation failed for ${sellerId}, using fallback rates:`, sellerAddressError.message);
          // If seller address validation fails, use fallback rates
          standardRatesObj[sellerId] = [
            {
              rateId: `fallback_standard_${sellerId}`,
              seller: sellerId,
              price: 5.99,
              type: 'standard',
              provider: 'Standard Shipping',
              servicelevel: 'Ground',
              estimatedDays: 5,
              durationTerms: '5-7 business days',
              deliveryTime: calculateDeliveryDate(5),
              items
            },
            {
              rateId: `fallback_fast_${sellerId}`,
              seller: sellerId,
              price: 12.99,
              type: 'standard',
              provider: 'Express Shipping',
              servicelevel: 'Express',
              estimatedDays: 2,
              durationTerms: '2-3 business days',
              deliveryTime: calculateDeliveryDate(2),
              items
            }
          ];
          continue; // Skip to next seller
        }
        
        const sellerAddressForShippo = validatedSellerAddress.address || validatedSellerAddress;
        
        standardRatesObj[sellerId] = await getStandardShippingRatesForSeller(
          sellerAddressForShippo, // Use validated seller address
          customerAddressForShippo, // Use actual address object, not validation response
          items
        );
        
        // FALLBACK STRATEGY #2: Empty Shippo API Response
        // Sometimes Shippo API succeeds but returns no rates (e.g., invalid addresses, no carriers serve route)
        // We detect this and provide fallback rates to prevent checkout flow interruption
        if (!standardRatesObj[sellerId] || standardRatesObj[sellerId].length === 0) {
          console.warn(`No Shippo rates returned for seller ${sellerId}. Using fallback.`);
          
          // Same fallback rates as Strategy #1 - consistency across failure modes
          // This ensures predictable user experience regardless of failure type
          standardRatesObj[sellerId] = [
            {
              rateId: `fallback_standard_${sellerId}`,
              seller: sellerId,
              price: 5.99, // Maintains consistent pricing across fallback scenarios
              type: 'standard',
              provider: 'Standard Shipping',
              servicelevel: 'Ground',
              estimatedDays: 5,
              durationTerms: '5-7 business days',
              deliveryTime: calculateDeliveryDate(5),
              items
            },
            {
              rateId: `fallback_fast_${sellerId}`,
              seller: sellerId,
              price: 12.99, // Premium option always available as backup
              type: 'standard',
              provider: 'Express Shipping',
              servicelevel: 'Express',
              estimatedDays: 2,
              durationTerms: '2-3 business days',
              deliveryTime: calculateDeliveryDate(2),
              items
            }
          ];
        }
      } catch (error) {
        // FALLBACK STRATEGY #3: Shippo API Failure/Error
        // Network issues, API downtime, authentication problems, etc.
        // Critical to provide fallback here as this is the most common failure mode
        console.error(`Shippo API failed for seller ${sellerId}:`, error.message);
        
        // BUSINESS CONTINUITY: Even if external shipping API fails completely,
        // we must allow customers to complete purchases with reasonable shipping options
        // These rates ensure revenue isn't lost due to API dependencies
        standardRatesObj[sellerId] = [
          {
            rateId: `fallback_standard_${sellerId}`,
            seller: sellerId,
            price: 5.99, // Conservative rate that covers actual shipping costs
            type: 'standard',
            provider: 'Standard Shipping',
            servicelevel: 'Ground',
            estimatedDays: 5, // Reasonable expectation for most US deliveries
            durationTerms: '5-7 business days',
            deliveryTime: calculateDeliveryDate(5),
            items
          },
          {
            rateId: `fallback_fast_${sellerId}`,
            seller: sellerId,
            price: 12.99, // Higher margin compensates for API failure uncertainty
            type: 'standard',
            provider: 'Express Shipping',
            servicelevel: 'Express',
            estimatedDays: 2,
            durationTerms: '2-3 business days',
            deliveryTime: calculateDeliveryDate(2),
            items
          }
        ];
      }

      // === UBER SAME-DAY SHIPPING (commented out) ===
      // To enable Uber same-day shipping, UNCOMMENT the following block:
      /*
      try {
        sameDayRatesObj[sellerId] = await getSameDayDeliveryOptionsForSeller(
          sellerAddress,
          customerAddress,
          items
        );
      } catch (error) {
        console.error(`Uber API failed for seller ${sellerId}:`, error.message);
        sameDayRatesObj[sellerId] = { error: 'Same-day delivery unavailable' };
      }
      */
    }

    // Compose shippingGroups array for frontend
    const shippingGroups = Object.keys(itemsBySeller).map((sellerId) => {
      const items = itemsBySeller[sellerId];
      const deliveryOptions = [];

      // Add Uber same-day if available
      // === UBER SAME-DAY SHIPPING (commented out) ===
      // To enable Uber same-day shipping, UNCOMMENT the following block:
      /*
      if (sameDayRatesObj[sellerId] && !sameDayRatesObj[sellerId].error) {
        const uber = sameDayRatesObj[sellerId];
        deliveryOptions.push({
          rateId: uber.id,
          label: 'ASAP (Today)',
          deliveryTime: uber.deliveryTime,
          price: uber.price,
          provider: uber.carrier,
          servicelevel: uber.service,
          durationTerms: `Delivered in about ${
            uber.estimatedTimeToDropoff || '90'
          } min`,
        });
      }
      */

      // Add Shippo standard options (cheapest, fastest)
      if (Array.isArray(standardRatesObj[sellerId])) {
        standardRatesObj[sellerId].forEach((shippo) => {
          deliveryOptions.push({
            rateId: shippo.rateId,
            label: formatDateLabel(shippo.deliveryTime),
            deliveryTime: shippo.deliveryTime,
            price: shippo.price,
            provider: shippo.provider,
            servicelevel: shippo.servicelevel,
            durationTerms: shippo.durationTerms,
          });
        });
      }

      return {
        groupId: sellerId,
        items,
        deliveryOptions,
      };
    });

    res.json({
      success: true,
      shippingGroups,
    });
  } catch (error) {
    console.error('=== SHIPPING ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      shippingGroups: [],
    });
  }
};

// ---------- PER-SELLER RATE SHOPPING HELPERS ----------

// Returns [cheapest, fastest] shipping rates for a single seller group
async function getStandardShippingRatesForSeller(
  sellerAddress,
  customerAddress,
  items
) {
  const parcel = buildParcelFromItems(items);
  
  // Debug logging to see the exact format being sent to Shippo
  // console.log('=== SHIPPO SHIPMENT DEBUG ===');
  // console.log('Seller Address:', JSON.stringify(sellerAddress, null, 2));
  // console.log('Customer Address:', JSON.stringify(customerAddress, null, 2));
  // console.log('Parcel:', JSON.stringify(parcel, null, 2));
  
  try {
    const shipment = await shippo.shipments.create({
      addressFrom: sellerAddress,
      addressTo: customerAddress,
      parcels: [parcel],
      async: false,
    });
    let rates = shipment.rates || [];
    // Remove air/express/overnight
    rates = rates.filter(
      (r) =>
        !/air|express|next day|2nd day|3rd day|overnight|saver/i.test(
          r.servicelevel.name
        )
    );
    if (!rates.length) return [];

    // Cheapest by price
    rates.sort((a, b) => Number(a.amount) - Number(b.amount));
    const cheapest = rates[0];

    // Fastest by estimatedDays (if available)
    const ratesWithDays = rates.filter(
      (r) => r.estimatedDays !== null && r.estimatedDays !== undefined
    );
    let fastest = null;
    if (ratesWithDays.length) {
      ratesWithDays.sort((a, b) => a.estimatedDays - b.estimatedDays);
      fastest = ratesWithDays[0];
    }

    const options = [];
    if (cheapest)
      options.push({
        rateId: cheapest.objectId,
        seller: cheapest.objectOwner,
        price: parseFloat(cheapest.amount),
        type: 'standard',
        provider: cheapest.provider,
        servicelevel: cheapest.servicelevel.name,
        estimatedDays: cheapest.estimatedDays,
        durationTerms: cheapest.durationTerms,
        deliveryTime: calculateDeliveryDate(cheapest.estimatedDays),
        items,
      });
    if (fastest && fastest.objectId !== cheapest.objectId) {
      options.push({
        rateId: fastest.objectId,
        seller: fastest.objectOwner,
        price: parseFloat(fastest.amount),
        type: 'standard',
        provider: fastest.provider,
        servicelevel: fastest.servicelevel.name,
        estimatedDays: fastest.estimatedDays,
        durationTerms: fastest.durationTerms,
        deliveryTime: calculateDeliveryDate(fastest.estimatedDays),
        items,
      });
    }
    return options;
  } catch (error) {
    console.error(`Error fetching rates for seller:`, error);
    return [];
  }
}

//create a getStandardShippingRatesForSeller function to be used as a route
async function getStandardShippingRatesForSellerRoute(req, res) {
  const { sellerAddress, customerAddress, items } = req.body;
  try {
    if (!sellerAddress || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        rates: [],
      });
    }
    const rates = await getStandardShippingRatesForSeller(
      sellerAddress,
      customerAddress,
      items
    );
    res.json({ success: true, rates });
  } catch (error) {
    console.error('Error in getStandardShippingRatesForSellerRoute:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      rates: [],
    });
  }
}

async function getSameDayDeliveryOptionsForSeller(
  sellerAddress,
  customerAddress,
  items
) {
  try {
    const isServiceable = await isSameDayServiceableWithAddresses(
      sellerAddress,
      customerAddress
    );
    if (!isServiceable) {
      return { error: 'Not serviceable for same-day' };
    }
    const accessToken = await getUberAccessToken();
    const pickUpAddress = convertAddressFormat(sellerAddress);
    const dropOffAddress = convertAddressFormat(customerAddress);
    const response = await axios.post(
      `https://api.uber.com/v1/customers/${process.env.UBER_CUSTOMER_ID}/delivery_quotes`,
      {
        pickup_address: pickUpAddress,
        dropoff_address: dropOffAddress,
        pickup_phone_number: '+15555555555',
        dropoff_phone_number: '+15555555555',
        pickup_deadline_dt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        dropoff_ready_dt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        dropoff_deadline_dt: new Date(
          Date.now() + 4 * 60 * 60 * 1000
        ).toISOString(),
        manifest_total_value: 1000,
        external_store_id: 'my_store_123',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      id: `uber_${Date.now()}`,
      carrier: 'Uber Direct',
      service: 'Same Day Delivery',
      price: response.data.fee / 100,
      currency: 'USD',
      estimatedTimeToDropoff: `${response.data.duration} min`,
      pickupDuration: response.data.pickup_duration,
      type: 'same_day',
      deliveryTime: calculateSameDayDeliveryTime(),
      metadata: {
        uberQuoteId: response.data.id,
        dropoffEta: response.data.dropoff_eta,
      },
    };
  } catch (error) {
    console.error('Uber Quote Error:', error.response?.data || error.message);
    return { error: 'Uber quote unavailable' };
  }
}

// ------ OPTIONAL: LABEL, TRACKING, ETC, UNCHANGED ------
const createShippingLabel = async (req, res) => {
  const { rateId } = req.body;
  try {
    const transaction = await shippo.transactions.create({
      rate: rateId,
      label_file_type: 'PDF',
      async: false,
    });
    res.json({ transaction });
  } catch (error) {
    console.error('Error creating shipping label:', error);
    res.json({ success: false, error: error.message });
  }
};

// Import the new shipping label utilities
const {
  createShippingLabelForSubOrder,
  markSubOrderAsShipped,
  getShippingLabelForSubOrder,
} = require('../utils/shipping/createShippingLabel');

/**
 * Create shipping label for a suborder using stored rateId
 */
const createSubOrderLabel = async (req, res) => {
  const { subOrderId } = req.body;
  
  try {
    if (!subOrderId) {
      return res.status(400).json({
        success: false,
        error: 'SubOrder ID is required'
      });
    }
    
    const result = await createShippingLabelForSubOrder(subOrderId);
    res.json(result);
    
  } catch (error) {
    console.error('Error creating suborder shipping label:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create shipping label'
    });
  }
};

/**
 * Mark suborder as shipped
 */
const markSubOrderShipped = async (req, res) => {
  const { subOrderId, trackingNumber, carrier } = req.body;
  
  try {
    if (!subOrderId || !trackingNumber || !carrier) {
      return res.status(400).json({
        success: false,
        error: 'SubOrder ID, tracking number, and carrier are required'
      });
    }
    
    const result = await markSubOrderAsShipped(subOrderId, trackingNumber, carrier);
    res.json(result);
    
  } catch (error) {
    console.error('Error marking suborder as shipped:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update suborder status'
    });
  }
};

/**
 * Get shipping label for a suborder
 */
const getSubOrderLabel = async (req, res) => {
  const { subOrderId } = req.params;
  
  try {
    if (!subOrderId) {
      return res.status(400).json({
        success: false,
        error: 'SubOrder ID is required'
      });
    }
    
    const result = await getShippingLabelForSubOrder(subOrderId);
    res.json(result);
    
  } catch (error) {
    console.error('Error retrieving suborder shipping label:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve shipping label'
    });
  }
};

const getSpecificShipment = async (req, res) => {
  const { shipmentId } = req.params;
  try {
    if (!shipmentId) throw new Error('Shipment ID is required');
    const result = await axios.get(
      `https://api.goshippo.com/shipments/${shipmentId}`,
      {
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
        },
      }
    );
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data || error.message,
      statusCode: error.response?.status || 500,
    });
  }
};

const listAllShipments = async (req, res) => {
  const { page, results } = req.query;
  try {
    const queryParams = {
      page: parseInt(page) || 1,
      results: parseInt(results) || 25,
    };
    const result = await shippo.shipments.list(queryParams);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error listing shipments:', error);
    res.json({
      success: false,
      error: error.response?.data || error.message,
      statusCode: error.response?.status || 500,
    });
  }
};

const createUberDelivery = async (req, res) => {
  const { quoteId, sellerAddress, customerInfo, items } = req.body;
  const token = await getUberAccessToken();
  const sellerAddr = convertAddressFormat(sellerAddress);
  const customerAddr = convertAddressFormat(customerInfo);
  try {
    const response = await axios.post(
      `https://api.uber.com/v1/customers/${process.env.UBER_CUSTOMER_ID}/deliveries`,
      {
        pickup_name: sellerAddress.name,
        pickup_address: sellerAddr,
        pickup_phone_number: '+1 555 341 9393',
        dropoff_name: customerInfo.name,
        dropoff_address: customerAddr,
        dropoff_phone_number: customerInfo.phone,
        manifest_items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          size: item.size || 'small',
        })),
        dropoff_notes: 'Second floor, black door to the right.',
        dropoff_seller_notes:
          'Fragile content - please handle the box with care during delivery.',
        dropoff_verification: {
          deliverable_action: 'deliverable_action_meet_at_door',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({
      success: true,
      deliveryDetails: response.data,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data?.message || error.message,
    });
  }
};

const trackUberDelivery = async (req, res) => {
  const { deliveryId } = req.params;
  const token = await getUberAccessToken();
  try {
    const response = await axios.get(
      `https://api.uber.com/v1/customers/${process.env.UBER_CUSTOMER_ID}/deliveries/${deliveryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({
      success: true,
      status: response.data.status,
      deliveryDetails: response.data,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data?.message || error.message,
    });
  }
};

const trackStandardShipment = async (req, res) => {
  const { trackingNumber, carrier } = req.body;
  try {
    const track = await shippo.trackingStatus.get(trackingNumber, carrier);
    res.json({
      success: true,
      status: track.trackingStatus,
      currentStatus: track,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Import sendEmail utility
const sendEmail = require('../utils/sendEmail');

/**
 * Email shipping label to seller
 */
const emailShippingLabel = async (req, res) => {
  const { labelUrl, email, orderId, trackingNumber } = req.body;
  
  try {
    if (!labelUrl || !email) {
      return res.status(400).json({
        success: false,
        error: 'Label URL and email address are required'
      });
    }
    
    // Create email HTML content using the existing template structure
    const getShippingLabelEmailTemplate = (labelUrl, orderId, trackingNumber) => {
      const content = `
        <div class="email-content">
          <h2 class="email-title">Your Shipping Label is Ready</h2>
          
          <p class="email-text">
            Hello,
          </p>
          
          <p class="email-text">
            Your shipping label has been generated and is ready for use. Please find the details below:
          </p>
          
          ${orderId || trackingNumber ? `
          <div class="info-box">
            <h3>Shipment Details:</h3>
            ${orderId ? `<div class="info-item"><strong>Order ID:</strong> ${orderId}</div>` : ''}
            ${trackingNumber ? `<div class="info-item"><strong>Tracking Number:</strong> ${trackingNumber}</div>` : ''}
          </div>
          ` : ''}
          
          <div class="alert alert-info">
            <strong>📦 Important Instructions:</strong><br>
            • Print the shipping label on standard 8.5" x 11" paper or on a thermal printer<br>
            • Ensure the barcode is clear and readable<br>
            • Attach the label securely to your package<br>
            • Keep a copy for your records
          </div>
          
          <div class="button-container">
            <a href="${labelUrl}" class="btn" target="_blank" rel="noopener">
              Download Shipping Label
            </a>
          </div>
          
          <p class="email-text">
            If you have any questions about shipping or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <ul class="email-list">
            <li>Label is valid for the shipping service selected</li>
            <li>Package your items securely before applying the label</li>
            <li>Drop off at the designated carrier location or schedule pickup</li>
            <li>Keep tracking number for shipment monitoring</li>
          </ul>
        </div>
      `;
      
      // Use the existing base template (simplified version since we don't have access to the full template here)
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Shipping Label Ready</title>
          <style>
            /* Reset and base styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .email-wrapper { padding: 20px; background-color: #f5f5f5; }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .email-header h1 {
              font-size: 28px;
              font-weight: 700;
              margin: 0;
            }
            .email-header .tagline {
              font-size: 14px;
              opacity: 0.9;
              margin-top: 5px;
            }
            .email-content { padding: 40px 30px; }
            .email-title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .email-text {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .info-box {
              background: white;
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin: 25px 0;
              border-radius: 0 6px 6px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .info-box h3 {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
            }
            .info-item {
              margin: 8px 0;
              font-size: 15px;
              color: #374151;
            }
            .info-item strong {
              color: #1f2937;
              font-weight: 600;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .btn {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-align: center;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            .alert {
              padding: 16px 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid;
            }
            .alert-info {
              background-color: #eff6ff;
              border-color: #3b82f6;
              color: #1e40af;
            }
            .email-list {
              margin: 20px 0;
              padding-left: 0;
            }
            .email-list li {
              list-style: none;
              padding: 8px 0;
              padding-left: 25px;
              position: relative;
              color: #4b5563;
            }
            .email-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #059669;
              font-weight: bold;
            }
            .email-footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 15px;
            }
            /* Responsive */
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 10px !important; }
              .email-container { width: 100% !important; border-radius: 0 !important; }
              .email-content { padding: 25px 20px !important; }
              .btn { padding: 14px 24px !important; width: 100% !important; max-width: 280px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="email-header">
                <h1>Soko</h1>
                <div class="tagline">Connecting Africa to America</div>
              </div>
              ${content}
              <div class="email-footer">
                <div class="footer-text">
                  Thank you for choosing Soko Platform
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };
    
    const emailHtml = getShippingLabelEmailTemplate(labelUrl, orderId, trackingNumber);
    
    // Send the email
    await sendEmail({
      to: email,
      subject: orderId ? `Shipping Label Ready - Order ${orderId}` : 'Your Shipping Label is Ready',
      html: emailHtml
    });
    
    console.log(`Shipping label emailed successfully to ${email}`);
    
    res.json({
      success: true,
      message: 'Shipping label emailed successfully',
      emailSent: true
    });
    
  } catch (error) {
    console.error('Error emailing shipping label:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to email shipping label'
    });
  }
};

module.exports = {
  getShippingOptions,
  listAllShipments,
  getSpecificShipment,
  createUberDelivery,
  trackUberDelivery,
  createShippingLabel,
  createSubOrderLabel,
  markSubOrderShipped,
  getSubOrderLabel,
  trackStandardShipment,
  getStandardShippingRatesForSellerRoute,
  emailShippingLabel,
};
