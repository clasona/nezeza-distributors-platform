const axios = require('axios');
require('dotenv').config();
const { Shippo } = require('shippo');

const headers = {
  Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
  'Content-Type': 'application/json',
};
const shippo = new Shippo({
  // apiKeyHeader: process.env.SHIPPO_API_TOKEN,
  apiKeyHeader: 'shippo_test_1e9e2a58e19088689b86398589e19fc267684285',
});

// Uber Direct - Access Token
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

// --- ADDRESS STRING BUILDER FOR GEOCODING ---
function addressToString(address) {
  // Use street1 for US addresses, do not use zip as a street
  return `${address.street1 || address.street}, ${address.city}, ${
    address.state
  } ${address.zip}, ${address.country || 'US'}`;
}

async function geocodeAddress(address) {
  try {
    const fullAddress = addressToString(address);

    // URL encode the address for the Mapbox API
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          country: address.country || 'US',
          limit: 1,
          types: 'address', // Focus ONLY on street addresses
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const result = response.data.features[0];
      const [lng, lat] = result.center; // Mapbox returns [longitude, latitude]
      return {
        lat,
        lng,
        formatted_address: result.place_name,
        place_id: result.id,
        address_components: result.context || [], // Mapbox uses 'context' for address components
        bbox: result.bbox, // Bounding box (additional Mapbox feature)
        relevance: result.relevance, // Relevance score (additional Mapbox feature)
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
    zip_code: address.zip,
    country: address.country,
  });
}

const groupItemsBySeller = (cartItems) => {
  const itemsBySeller = {};
  cartItems.forEach((item) => {
    const { sellerStoreId } = item;
    if (!itemsBySeller[sellerStoreId._id])
      itemsBySeller[sellerStoreId._id] = [];
    itemsBySeller[sellerStoreId._id].push(item);
    // console.log('Grouped:', itemsBySeller);
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
  return deliveryTime.toISOString().split('T')[0];
};

function formatDateLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
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
      console.log(
        `Distance from ${origin} to ${destination}: ${distanceInMiles.toFixed()} miles`
      );
      console.log(distanceInMiles <= 10);
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

// --- MAIN SHIPPING CONTROLLER FOR FRONTEND ---
const getShippingOptions = async (req, res) => {
  const { cartItems, customerAddress, sellerAddress } = req.body;
  try {
    const [standardRatesObj, sameDayRatesObj] = await Promise.all([
      getStandardShippingRates(sellerAddress, customerAddress, cartItems),
      getSameDayDeliveryOptions(sellerAddress, customerAddress, cartItems),
    ]);
    const itemsBySeller = groupItemsBySeller(cartItems);
    const shippingGroups = Object.keys(itemsBySeller).map((sellerId) => {
      const items = itemsBySeller[sellerId];
      const deliveryOptions = [];
      // Uber (still single, as Uber API only returns one)
      if (
        sameDayRatesObj &&
        sameDayRatesObj[sellerId] &&
        !sameDayRatesObj[sellerId].error
      ) {
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
      // Shippo: push ALL available rates as separate options
      if (standardRatesObj && Array.isArray(standardRatesObj[sellerId])) {
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
    res.status(500).json({
      success: false,
      error: error.message,
      shippingGroups: [],
    });
  }
};

/**
 * Fetches and filters standard shipping rates (non-air/express) from Shippo for a multi-seller cart.
 *
 * For each seller in the cart, this function:
 *  1. Bundles the seller's items into a single parcel for rate quoting.
 *  2. Requests all available shipping rates from Shippo for the given origin (seller) and destination (customer).
 *  3. Excludes "air", "express", "overnight", and similar rush delivery services, focusing on practical US shipping options.
 *  4. Picks ONLY TWO delivery options per seller group:
 *      - The absolute cheapest option (best for price-conscious buyers).
 *      - The absolute fastest option (lowest estimatedDays), if different from cheapest.
 *  5. Formats each selected rate into a standardized delivery option object used by the frontend.
 *
 * Returns an object keyed by sellerId, where each value is an array of up to 2 delivery options for that seller.
 *
 * @param {Object} sellerAddress - The address of the seller/shipper (origin).
 * @param {Object} shippingAddress - The customer's shipping address (destination).
 * @param {Array} cartItems - Array of all cart items (must include sellerId).
 * @returns {Object} { [sellerId]: [deliveryOption, ...] }
 */
const getStandardShippingRates = async (
  sellerAddress,
  shippingAddress,
  cartItems
) => {
  const itemsBySeller = groupItemsBySeller(cartItems);
  const sellerShippingRates = {};
  for (const sellerId in itemsBySeller) {
    const sellerItems = itemsBySeller[sellerId];
    const parcel = buildParcelFromItems(sellerItems);
    try {
      const shipment = await shippo.shipments.create({
        addressFrom: sellerAddress,
        addressTo: shippingAddress,
        parcels: [parcel],
        async: false,
      });
      let rates = shipment.rates || [];
      // 1. Filter out air/express/overnight services
      rates = rates.filter(
        (r) =>
          !/air|express|next day|2nd day|3rd day|overnight|saver/i.test(
            r.servicelevel.name
          )
      );
      if (!rates.length) {
        sellerShippingRates[sellerId] = [];
        continue;
      }
      // 2. Pick the absolute cheapest (lowest price)
      rates.sort((a, b) => Number(a.amount) - Number(b.amount));
      const cheapest = rates[0];
      // 3. Pick the absolute fastest (lowest estimatedDays, but not already chosen)
      const ratesWithDays = rates.filter(
        (r) => r.estimatedDays !== null && r.estimatedDays !== undefined
      );
      let fastest = null;
      if (ratesWithDays.length) {
        ratesWithDays.sort((a, b) => a.estimatedDays - b.estimatedDays);
        fastest = ratesWithDays[0];
      }
      // 4. Add cheapest and fastest (if not the same)
      const options = [];
      if (cheapest) options.push(cheapest);
      if (fastest && fastest.objectId !== cheapest.objectId) {
        options.push(fastest);
      }
      // 5. Map to delivery option objects for the frontend
      sellerShippingRates[sellerId] = options.map((r) => ({
        rateId: r.objectId,
        seller: r.objectOwner,
        price: parseFloat(r.amount),
        type: 'standard',
        provider: r.provider,
        servicelevel: r.servicelevel.name,
        estimatedDays: r.estimatedDays,
        durationTerms: r.durationTerms,
        deliveryTime: calculateDeliveryDate(r.estimatedDays),
        items: sellerItems,
      }));
    } catch (error) {
      console.error(`Error fetching rates for seller ${sellerId}:`, error);
      sellerShippingRates[sellerId] = [];
    }
  }
  return sellerShippingRates;
};

// --- UBER DIRECT (Same Day) ---
async function createUberSameDayQuote(
  sellerAddress,
  customerAddress,
  cartItems
) {
  const itemsBySeller = groupItemsBySeller(cartItems);
  const sellerShippingRates = {};
  for (const sellerId in itemsBySeller) {
    const sellerItems = itemsBySeller[sellerId];
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
          ).toISOString(),
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
      sellerShippingRates[sellerId] = {
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
      sellerShippingRates[sellerId] = { error: 'Uber quote unavailable' };
    }
  }
  return sellerShippingRates;
}

const getSameDayDeliveryOptions = async (
  sellerAddress,
  customerAddress,
  cartItems
) => {
  try {
    const isServiceable = await isSameDayServiceableWithAddresses(
      sellerAddress,
      customerAddress
    );
    if (!isServiceable) {
      return {};
    }
    const quote = await createUberSameDayQuote(
      sellerAddress,
      customerAddress,
      cartItems
    );
    return quote;
  } catch (error) {
    console.error('Uber Direct API Error:', error);
    return {};
  }
};

// ------ OTHER CONTROLLER EXPORTS (unchanged from your original) ------

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
    res.json({ success: false, error: error.message });
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

module.exports = {
  getShippingOptions,
  listAllShipments,
  getSpecificShipment,
  createUberDelivery,
  trackUberDelivery,
  createShippingLabel,
  trackStandardShipment,
};
