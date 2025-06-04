const axios = require('axios');
require('dotenv').config();
// Helper methods
console.log(process.env.UBER_CLIENT_ID);
async function geocodeAddress(address) {
  try {
    const fullAddress = `${address.street}${
      address?.street2 ? ', ' + address?.street2 : ''
    }, ${address.city}, ${address.state} ${address.zip}, ${
      address.country || 'US'
    }`;
    console.log(process.env.UBER_CLIENT_ID);

    // URL encode the address for the Mapbox API
    const encodedAddress = encodeURIComponent(fullAddress);
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
      {
        params: {
          access_token:
            'pk.eyJ1IjoiZW50ZXJ0YWluZXIyNTAiLCJhIjoiY21iMmRlM2U3MGgxMTJpcHYzczEyYWkyMCJ9.mk2ryK-XDFnvcOodF_EA2Q',
          country: address.country || 'US',
          limit: 1,
          types: 'address,poi', // Focus on addresses and points of interest
        },
      }
    );

    console.log(response.data);

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
      console.log(geocodedData);
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
const dropoffAddress = {
  street: '720 Airport Blvd',
  city: 'Austin',
  state: 'TX',
  zip_code: '78702',
  country: 'US',
};
//geocodeAddress(dropoffAddress);

const seller = [
  {
    amount: '9.21',
    amountLocal: '9.21',
    currency: 'USD',
    currencyLocal: 'USD',
    attributes: ['BESTVALUE'],
    carrierAccount: 'e2d002ae9420420393d924cabf0fefda',
    durationTerms:
      'Delivery within 1, 2, or 3 days based on where your package started and where it’s being sent.',
    estimatedDays: 2,
    messages: [],
    objectCreated: '2025-05-24T17:48:37.058Z',
    objectId: 'b22a813a38054ee7bf3ba7a7552ca3ac',
    objectOwner: 'abotgeorge1@gmail.com',
    provider: 'USPS',
    providerImage75:
      'https://shippo-static.s3.amazonaws.com/providers/75/USPS.png',
    providerImage200:
      'https://shippo-static.s3.amazonaws.com/providers/200/USPS.png',
    servicelevel: {
      name: 'Priority Mail',
      terms: '',
      token: 'usps_priority',
      extendedToken: 'usps_priority',
    },
    shipment: '1189bb4c82114d4f99d839c2f04a9c1c',
    test: true,
    zone: '1',
  },
  {
    amount: '32.10',
    amountLocal: '32.10',
    currency: 'USD',
    currencyLocal: 'USD',
    attributes: ['FASTEST'],
    carrierAccount: 'e2d002ae9420420393d924cabf0fefda',
    durationTerms: 'Overnight delivery to most U.S. locations.',
    estimatedDays: 1,
    messages: [],
    objectCreated: '2025-05-24T17:48:37.058Z',
    objectId: 'e4ab68a25d954a59831981db58e04d1f',
    objectOwner: 'abotgeorge1@gmail.com',
    provider: 'USPS',
    providerImage75:
      'https://shippo-static.s3.amazonaws.com/providers/75/USPS.png',
    providerImage200:
      'https://shippo-static.s3.amazonaws.com/providers/200/USPS.png',
    servicelevel: {
      name: 'Priority Mail Express',
      terms: '',
      token: 'usps_priority_express',
      extendedToken: 'usps_priority_express',
    },
    shipment: '1189bb4c82114d4f99d839c2f04a9c1c',
    test: true,
    zone: '1',
  },
  {
    amount: '7.61',
    amountLocal: '7.61',
    currency: 'USD',
    currencyLocal: 'USD',
    attributes: ['CHEAPEST'],
    carrierAccount: 'e2d002ae9420420393d924cabf0fefda',
    durationTerms: 'Delivery in 2 to 5 days.',
    estimatedDays: 3,
    messages: [],
    objectCreated: '2025-05-24T17:48:37.058Z',
    objectId: 'eb9ac48956594f46bd9b52ba776c6b66',
    objectOwner: 'abotgeorge1@gmail.com',
    provider: 'USPS',
    providerImage75:
      'https://shippo-static.s3.amazonaws.com/providers/75/USPS.png',
    providerImage200:
      'https://shippo-static.s3.amazonaws.com/providers/200/USPS.png',
    servicelevel: {
      name: 'Ground Advantage',
      terms: '',
      token: 'usps_ground_advantage',
      extendedToken: 'usps_ground_advantage',
    },
    shipment: '1189bb4c82114d4f99d839c2f04a9c1c',
    test: true,
    zone: '1',
  },
];

const lowestRate = seller.reduce(
  (min, r) => (Number(r.amount) < Number(min.amount) ? r : min),
  seller[0]
);

console.log(lowestRate.servicelevel.name); // "Ground Advantage"
console.log(lowestRate.amount); // "7.61"

console.log(lowestRate);

module.exports = { geocodeAddress };
