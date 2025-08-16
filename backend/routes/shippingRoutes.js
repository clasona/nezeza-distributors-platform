const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
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
} = require('../controllers/shippingController');


router.post('/shipments/', getShippingOptions); //creates same-day and standard shipping
router.post('/shipments/delivery', createUberDelivery); // creates uber delivery
router.get('/shipment/:shipmentId', getSpecificShipment);
router.get('/shipments/delivery/:deliveryId', trackUberDelivery);
router.post('/shipments/labels/', createShippingLabel);
router.post('/shipments/tracks/', trackStandardShipment);
router.get('/shipments', listAllShipments);
router.post('/shipments/rates', getStandardShippingRatesForSellerRoute);

// New suborder shipping label routes
router.post('/suborder/label', createSubOrderLabel); // Create label for suborder
router.post('/suborder/ship', markSubOrderShipped); // Mark suborder as shipped
router.get('/suborder/:subOrderId/label', getSubOrderLabel); // Get label for suborder

// Email shipping label route
router.post('/email-label', emailShippingLabel); // Email shipping label to seller

module.exports = router;

// try {
//   const accessToken = await getUberAccessToken();
//   const pickUpAddress = convertAddressFormat(sellerAddress);
//   const dropOffAddress = convertAddressFormat(customerAddress);

//   const itemsBySeller = groupItemsBySeller(cartItems);

//   const response = await axios.post(
//     `https://api.uber.com/v1/customers/${process.env.UBER_CUSTOMER_ID}/delivery_quotes`,

//     {
//       pickup_address: pickUpAddress,
//       dropoff_address: dropOffAddress,
//       pickup_phone_number: '+15555555555',
//       dropoff_phone_number: '+15555555555',
//       pickup_deadline_dt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min window
//       dropoff_ready_dt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
//       dropoff_deadline_dt: new Date(
//         Date.now() + 4 * 60 * 60 * 1000
//       ).toISOString(), // 4 hour window
//       manifest_total_value: 1000,
//       external_store_id: 'my_store_123',
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     }
//   );
//   return {
//     id: `uber_${Date.now()}`,
//     carrier: 'Uber Direct',
//     service: 'Same Day Delivery',
//     price: response.data.fee / 100, // Convert cents to dollars
//     currency: 'USD',
//     estimatedTimeToDropoff: `${response.data.duration} min`,
//     pickupDuration: response.data.pickup_duration,
//     type: 'same_day',
//     deliveryTime: calculateSameDayDeliveryTime(),
//     metadata: {
//       uberQuoteId: response.data.id,
//       dropoffEta: response.data.dropoff_eta,
//     },
//   };
// } catch (error) {
//   console.error('Uber Quote Error:', error.response?.data || error.message);
//   throw new Error(
//     'Failed to get Uber quote: ' +
//       (error.response?.data?.message || error.message)
//   );
// }
