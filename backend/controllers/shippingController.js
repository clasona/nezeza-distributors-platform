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
    errorLoggingMiddleware(err, req, res);
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

const getShippingOptions = async (req, res) => {
  const { cartItems, customerAddress } = req.body;

  try {
    console.log('=== SHIPPING DEBUG ===');
    console.log('Cart items received:', JSON.stringify(cartItems, null, 2));
    console.log('Customer address:', JSON.stringify(customerAddress, null, 2));
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No cart items provided',
        shippingGroups: [],
      });
    }

    const itemsBySeller = groupItemsBySeller(cartItems);
    console.log('Items grouped by seller:', JSON.stringify(itemsBySeller, null, 2));

    const standardRatesObj = {};
    const sameDayRatesObj = {};

    // Loop over each seller group
    for (const sellerId in itemsBySeller) {
      const items = itemsBySeller[sellerId];
      // Get seller address from first item in group
      const sellerAddress =
        items[0].sellerAddress ||
        (items[0].sellerStoreId && items[0].sellerStoreId.address);
      
      console.log(`Seller ${sellerId} address:`, JSON.stringify(sellerAddress, null, 2));

      // Defensive: If seller address missing, skip
      if (!sellerAddress) {
        console.warn(`Missing seller address for seller ${sellerId}`);
        standardRatesObj[sellerId] = [];
        sameDayRatesObj[sellerId] = { error: 'Seller address missing' };
        continue;
      }

      // Standard Shipping (Shippo)
      standardRatesObj[sellerId] = await getStandardShippingRatesForSeller(
        sellerAddress,
        customerAddress,
        items
      );

      // Same Day (Uber, if available)
      sameDayRatesObj[sellerId] = await getSameDayDeliveryOptionsForSeller(
        sellerAddress,
        customerAddress,
        items
      );
    }

    // Compose shippingGroups array for frontend
    const shippingGroups = Object.keys(itemsBySeller).map((sellerId) => {
      const items = itemsBySeller[sellerId];
      const deliveryOptions = [];

      // Add Uber same-day if available
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
    errorLoggingMiddleware(err, req, res);
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
    errorLoggingMiddleware(err, req, res);
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
    errorLoggingMiddleware(err, req, res);
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
