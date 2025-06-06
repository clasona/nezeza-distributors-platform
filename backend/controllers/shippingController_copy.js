const axios = require('axios');
require('dotenv').config();
const { Shippo } = require('shippo');
const headers = {
  Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
  'Content-Type': 'application/json',
};
const shippo = new Shippo({
  apiKeyHeader: 'shippo_test_1e9e2a58e19088689b86398589e19fc267684285',
});

// Uber Direct - Access Token
async function getUberAccessToken() {
  try {
    // Create form-encoded data
    const params = new URLSearchParams();
    params.append('client_id', process.env.UBER_CLIENT_ID);
    params.append('client_secret', process.env.UBER_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'eats.deliveries'); // Correct scope

    const response = await axios.post(
      'https://login.uber.com/oauth/v2/token',
      params, // Send as body, not query params
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    //console.log('Access token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Uber Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to get Uber access token');
  }
}

async function geocodeAddress(address) {
  try {
    const fullAddress = `${address.street}${
      address?.street2 ? ', ' + address?.street2 : ''
    }, ${address.city}, ${address.state} ${address.zip}, ${
      address.country || 'US'
    }`;
    //console.log(process.env.MAPBOX_API_KEY);

    // URL encode the address for the Mapbox API
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          country: address.country || 'US',
          limit: 1,
          types: 'address,poi', // Focus on addresses and points of interest
        },
      }
    );

    //console.log(response.data);

    if (response.data.features && response.data.features.length > 0) {
      const result = response.data.features[0];
      const [lng, lat] = result.center; // Mapbox returns [longitude, latitude]

      const geocodedData = {
        lat: lat,
        lng: lng,
        formatted_address: result.place_name,
        place_id: result.id,
        address_components: result.context || [], // Mapbox uses 'context' for address components
        bbox: result.bbox, // Bounding box (additional Mapbox feature)
        relevance: result.relevance, // Relevance score (additional Mapbox feature)
      };
      //console.log(geocodedData);
      // Cache the result
      return geocodedData;
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

// Uber Direct - Same-Day Delivery Quote

async function createUberSameDayQuote(
  sellerAddress,
  customerAddress,
  cartItems
) {
  const itemsBySeller = groupItemsBySeller(cartItems);
  // console.log(itemsBySeller);
  const sellerShippingRates = {};
  //Loop through each seller's items
  for (const sellerId in itemsBySeller) {
    const sellerItems = itemsBySeller[sellerId];
    //console.log(sellerId, sellerItems);
    try {
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
          pickup_deadline_dt: new Date(
            Date.now() + 30 * 60 * 1000
          ).toISOString(), // 30 min window
          dropoff_ready_dt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          dropoff_deadline_dt: new Date(
            Date.now() + 4 * 60 * 60 * 1000
          ).toISOString(), // 4 hour window
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
      sellerShippingRates[sellerId] = {
        id: `uber_${Date.now()}`,
        carrier: 'Uber Direct',
        service: 'Same Day Delivery',
        price: response.data.fee / 100, // Convert cents to dollars
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
      //   sellerShippingRates[sellerId] = { // if need additional values
      //     data: response.data,
      //   };
    } catch (error) {
      console.error('Uber Quote Error:', error.response?.data || error.message);
      throw new Error(
        'Failed to get Uber quote: ' +
          (error.response?.data?.message || error.message)
      );
    }
  }

  return sellerShippingRates;
  //res.json({ shippment, sellerShippingRates });
}

function convertAddressFormat(address) {
  const streetAddress = [address.street];
  const convertedAddress = {
    street_address: streetAddress,
    city: address.city,
    state: address.state,
    zip_code: address.Code,
    country: address.country,
  };

  // Return as JSON string
  return JSON.stringify(convertedAddress);
}

async function isSameDayServiceableWithAddresses(
  originAddress,
  destinationAddress
) {
  try {
    // First, geocode both addresses to get coordinates
    const originCoords = await geocodeAddress(originAddress);
    const destCoords = await geocodeAddress(destinationAddress);

    if (!originCoords || !destCoords) {
      console.error('Failed to geocode one or both addresses');
      return false;
    }

    // Format coordinates as "longitude,latitude"
    const origin = `${originCoords.lng},${originCoords.lat}`;
    const destination = `${destCoords.lng},${destCoords.lat}`;
    // Use the coordinate-based function
    return await isSameDayServiceable(origin, destination);
  } catch (error) {
    console.error('Address-based distance calculation error:', error);
    return false;
  }
}
async function isSameDayServiceable(origin, destination) {
  try {
    //console.log(origin, destination);
    // Mapbox Matrix API endpoint
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
    // Check if we got a valid response
    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceInMeters = route.distance; // Distance in meters
      const distanceInMiles = distanceInMeters * 0.000621371; // Convert meters to miles
      const durationInSeconds = route.duration; // Duration in seconds

      console.log(
        `Distance: ${distanceInMiles.toFixed(1)} miles, Duration: ${Math.round(
          durationInSeconds / 60
        )} minutes`
      );

      return distanceInMiles <= 10; // You can set your own threshold
    } else {
      console.error('No route found between origin and destination');
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

const collectErrors = (results) => {
  return results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'Unknown error');
};

/**
 * Get all available shipping options for a customer
 */
const getShippingOptionsCopy = async (req, res) => {
  const { cartItems, customerAddress, sellerAddress } = req.body;
  const shippingOptions = [];
  try {
    const [standardRates, sameDayOptions] = await Promise.allSettled([
      getStandardShippingRates(sellerAddress, customerAddress, cartItems),
      getSameDayDeliveryOptions(sellerAddress, customerAddress, cartItems),
    ]);
    // Add standard shipping options
    if (standardRates.status === 'fulfilled') {
      shippingOptions.push(standardRates.value);
    }
    // Add same-day delivery options
    if (sameDayOptions.status === 'fulfilled') {
      shippingOptions.push(sameDayOptions.value);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      options: [],
    };
  }

  res.json({
    success: true,
    shippingOptions,
  });
};

/**
 * Get same-day delivery options via Uber Direct
 */
const getSameDayDeliveryOptions = async (
  sellerAddress,
  customerAddress,
  cartItems
) => {
  try {
    // Check if location is serviceable
    const isServiceable = await isSameDayServiceableWithAddresses(
      sellerAddress,
      customerAddress
    );
    if (!isServiceable) {
      //console.log(isServiceable);
      return [];
    }
    //console.log(isServiceable);
    const quote = await createUberSameDayQuote(
      sellerAddress,
      customerAddress,
      cartItems
    );

    if (!quote) return [];

    return quote;
  } catch (error) {
    console.error('Uber Direct API Error:', error);
    return [];
  }
};

/**
 * Utility to calculate shipping rates for multi-seller cart
 * @param {Array} cartItems - Array of cart items (must include sellerId and dimensions)
 * @param {Object} shippingAddress - Customer shipping address
 * @returns {Object} sellerShippingRates
 */
const getStandardShippingRates = async (
  sellerAddress,
  shippingAddress,
  cartItems
) => {
  ///const { cartItems, shippingAddress } = req.body;
  // Group items by seller
  const itemsBySeller = groupItemsBySeller(cartItems);
  const sellerShippingRates = {};

  //Loop through each seller's items
  for (const sellerId in itemsBySeller) {
    const sellerItems = itemsBySeller[sellerId];

    // TODO: Fetch seller's warehouse/store address (use default for demo)
    //console.log(sellerAddress);
    // Build a single parcel for the seller's items
    const parcel = buildParcelFromItems(sellerItems);
    try {
      // Step 4: Request shipping rates from Shippo
      const shipment = await shippo.shipments.create({
        addressFrom: sellerAddress,
        addressTo: shippingAddress,
        parcels: [parcel],
        async: false,
      });
      //console.log('shipping', shipment);
      //Pick the lowest rate (or filter preferred)
      const rates = shipment.rates || [];
      const lowestRate = rates.reduce(
        (min, r) => (Number(r.amount) < Number(min.amount) ? r : min),
        rates[0]
      );

      sellerShippingRates[sellerId] = {
        rateId: lowestRate.objectId, // Use this when purchasing the label
        seller: lowestRate.objectOwner,
        price: parseFloat(lowestRate.amount),
        type: 'standard',
        provider: lowestRate.provider,
        servicelevel: lowestRate.servicelevel.name,
        estimatedDays: lowestRate.estimatedDays,
        durationTerms: lowestRate.durationTerms,
        deliveryTime: calculateDeliveryDate(lowestRate.estimatedDays),
        items: sellerItems,
      };
    } catch (error) {
      console.error(`Error fetching rates for seller ${sellerId}:`, error);
      sellerShippingRates[sellerId] = {
        error: 'Unable to fetch shipping rates',
      };
    }
  }
  //console.log('test', sellerShippingRates);
  return sellerShippingRates;
  //res.json({ shippment, sellerShippingRates });
};

const groupItemsBySeller = (cartItems) => {
  //console.log(cartItems);
  const itemsBySeller = {};
  cartItems.forEach((item) => {
    const { sellerId } = item;
    if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
    itemsBySeller[sellerId].push(item);
  });
  return itemsBySeller;
};

const calculateDeliveryDate = (estimatedDays) => {
  if (!estimatedDays) return null;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  return deliveryDate.toISOString().split('T')[0];
};

const calculateSameDayDeliveryTime = () => {
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now
  return deliveryTime.toLocaleString();
};
/**
 * Helper to create parcel from items
 */
function buildParcelFromItems(items) {
  let totalWeight = 0;
  let maxLength = 0,
    maxWidth = 0,
    totalHeight = 0;

  items.forEach((item) => {
    const quantity = item.quantity || 1;
    totalWeight += (item.weight || 1) * quantity;
    maxLength = Math.max(maxLength, item.length || 6);
    maxWidth = Math.max(maxWidth, item.width || 6);
    totalHeight += (item.height || 4) * quantity;
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

/**
 * Create a shipping label (for standard shipping)
 */
const createShippingLabel = async (req, res) => {
  const { rateId } = req.body;
  //console.log(rateId);
  try {
    const transaction = await shippo.transactions.create({
      rate: rateId,
      label_file_type: 'PDF',
      async: false,
    });
    console.log(transaction);
    // res.json({
    //   success: true,
    //   labelUrl: transaction.labelUrl,
    //   trackingNumber: transaction.trackingNumber,
    //   trackingStatus: transaction.trackingStatus,
    //   transactionId: transaction.objectId,
    //   trackingUrlProvider: transaction.trackingUrlProvider,
    // });

    res.json({ transaction });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

const getSpecificShipment = async (req, res) => {
  const { shipmentId } = req.params;
  console.log(req.params);
  try {
    if (!shipmentId) {
      throw new Error('Shipment ID is required');
    }

    const result = await axios.get(
      `https://api.goshippo.com/shipments/${shipmentId}`,
      { headers }
    );
    //const result = await shippo.shipments.get(shipmentId);
    console.log(result.data);
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error retrieving specific shipment:', error);

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
    console.log(`Retrieved ${result.results.length} shipments`);
    console.log(result);
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

/**
 * Create Uber Direct delivery
 */
uberConfig = {
  baseURL:
    'https://api.uber.com/v1/customers/9b7d7e85-ecae-5bb4-a6fb-8c05e24e2a88/deliveries',
};
const createUberDelivery = async (req, res) => {
  const { quoteId, sellerAddress, customerInfo, items } = req.body;
  //console.log(uberConfig.baseURL);
  const token = await getUberAccessToken();
  const sellerAddr = convertAddressFormat(sellerAddress);
  const customerAddr = convertAddressFormat(customerInfo);
  console.log(typeof quoteId);
  try {
    const response = await axios.post(
      uberConfig.baseURL,
      {
        //quote_id: quoteId, findout why error when included
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
  console.log(`${uberConfig.baseURL}${deliveryId}`);
  try {
    const response = await axios.get(`${uberConfig.baseURL}/${deliveryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data);
    res.json({
      success: true,
      status: response.data.status,
      deliveryDetails: response.data,
    });
  } catch (error) {
    //console.log(error);
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
    console.log(track);
    res.json({
      success: true,
      status: track.trackingStatus,
      currentStatus: track,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

const test = async () => {
  //const rateId = 'edbc4129846643ee91c6cfbbdd38e763';
  //getShipment('fdb497dd42d847c5b9d501676d665265')
  //   const d = await getSpecificShipment('dc559311e968447089e12ead6fc49cf4');
  //   // const d = await listAllShipments();
  //   // const d = await createShippingLabel(rateId, 'customer');
  //   const d = await trackUberDelivery('del_YqE-mjjIQvydPQiHChAjag');
  //const d = await trackStandardShipment('SHIPPO_TRANSIT', 'shippo');
  // console.log(d);
};
test();

module.exports = {
  getShippingOptionsCopy,
  listAllShipments,
  getSpecificShipment,
  createUberDelivery,
  trackUberDelivery,
  createShippingLabel,
  trackStandardShipment,
};
