# Order & Shipping Workflow Testing Guide

This guide provides comprehensive testing instructions for the Nezeza order and shipping workflow using Postman.

## Prerequisites

Before testing, ensure you have:

1. **Backend server running** on `http://localhost:5000`
2. **Postman installed** with the collection imported
3. **Valid test data** (user accounts, products, stores)
4. **Environment variables** configured in Postman
5. **API keys** configured for:
   - Stripe (payment processing)
   - Shippo (shipping labels)
   - Mapbox (address geocoding - optional)

## Environment Setup

### Postman Variables

Set these collection variables in Postman:

- `baseUrl`: `http://localhost:5000/api/v1`
- `authToken`: (automatically set after login)
- `paymentIntentId`: (automatically set after creating payment intent)
- `orderId`: (automatically set after order creation)
- `subOrderId`: (automatically set after order creation)

### Test Data Requirements

You'll need:
- A valid user account with email/password
- A product in the database with proper sellerStoreId
- A store with valid address information
- Proper MongoDB ObjectIds for testing

## Testing Workflow

### 1. Authentication
Start by logging in to get an authentication token:

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "buyer@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### 2. Get Shipping Options

Test the shipping calculation system:

```bash
POST /shipping/shipments/
Content-Type: application/json

{
  "cartItems": [
    {
      "productId": "64f1a1b2c3d4e5f6a7b8c9d0",
      "product": {
        "_id": "64f1a1b2c3d4e5f6a7b8c9d0",
        "title": "Sample Product",
        "price": 29.99,
        "taxRate": 8.5,
        "weight": 1.5,
        "length": 8,
        "width": 6,
        "height": 4
      },
      "quantity": 2,
      "price": 29.99,
      "sellerStoreId": {
        "_id": "64f1a1b2c3d4e5f6a7b8c9d1",
        "address": {
          "street1": "123 Seller St",
          "city": "Chicago",
          "state": "IL",
          "zipCode": "60601",
          "country": "US"
        }
      }
    }
  ],
  "customerAddress": {
    "street1": "456 Customer Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "shippingGroups": [
    {
      "groupId": "64f1a1b2c3d4e5f6a7b8c9d1",
      "items": [...],
      "deliveryOptions": [
        {
          "rateId": "shippo_rate_id_here",
          "label": "Monday, Dec 4",
          "deliveryTime": "2023-12-04",
          "price": 12.99,
          "provider": "USPS",
          "servicelevel": "Ground",
          "durationTerms": "5-7 business days"
        }
      ]
    }
  ]
}
```

### 3. Create Payment Intent

Create a Stripe payment intent with order data:

```bash
POST /payment/create-payment-intent
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "orderItems": [
    {
      "productId": "64f1a1b2c3d4e5f6a7b8c9d0",
      "product": {
        "_id": "64f1a1b2c3d4e5f6a7b8c9d0",
        "title": "Sample Product",
        "taxRate": 8.5
      },
      "quantity": 2,
      "price": 29.99,
      "sellerStoreId": "64f1a1b2c3d4e5f6a7b8c9d1"
    }
  ],
  "shippingAddress": {
    "street1": "456 Customer Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "selectedShippingOptions": {
    "64f1a1b2c3d4e5f6a7b8c9d1": "{{selectedRateId}}"
  },
  "shippingTotal": 12.99
}
```

**Expected Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_1234567890abcdef"
}
```

### 4. Simulate Stripe Webhook

Simulate a successful payment to trigger order creation:

```bash
POST /payment/webhook
Content-Type: application/json
stripe-signature: test_signature

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "{{paymentIntentId}}",
      "amount": 6997,
      "currency": "usd",
      "status": "succeeded",
      "payment_method": "pm_1234567890abcdef",
      "metadata": {
        "tempOrderDataId": "temp_order_id_placeholder",
        "totalAmount": "69.97",
        "subtotal": "59.98",
        "totalTax": "5.10",
        "totalShipping": "12.99",
        "buyerId": "64f1a1b2c3d4e5f6a7b8c9d2",
        "customerEmail": "buyer@example.com",
        "customerFirstName": "John"
      }
    }
  }
}
```

### 5. Retrieve Created Order

Get the order that was created by the webhook:

```bash
GET /orders/buying/payment/{{paymentIntentId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "order": {
    "_id": "order_id_here",
    "totalAmount": 69.97,
    "paymentStatus": "Paid",
    "fulfillmentStatus": "Placed",
    "subOrders": ["suborder_id_here"],
    "orderItems": [...],
    "shippingAddress": {...}
  }
}
```

## Order Management Testing

### SubOrder Status Updates

Test updating suborder status through the fulfillment pipeline:

1. **Processing Status:**
```bash
PATCH /orders/sub/{{subOrderId}}/status
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "fulfillmentStatus": "Processing"
}
```

2. **Awaiting Shipment:**
```bash
PATCH /orders/sub/{{subOrderId}}/status
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "fulfillmentStatus": "Awaiting Shipment"
}
```

## Shipping Label Testing

### Create Shipping Label

Generate a shipping label using the stored rate ID:

```bash
POST /shipping/suborder/label
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "subOrderId": "{{subOrderId}}"
}
```

**Expected Response:**
```json
{
  "success": true,
  "trackingNumber": "1Z999AA1234567890",
  "labelUrl": "https://shippo-delivery-east.s3.amazonaws.com/xxx.pdf",
  "carrier": "UPS",
  "servicelevel": "Ground",
  "estimatedDays": 5,
  "trackingUrl": "https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=1Z999AA1234567890"
}
```

### Get Shipping Label

Retrieve existing label information:

```bash
GET /shipping/suborder/{{subOrderId}}/label
Authorization: Bearer {{authToken}}
```

### Mark as Shipped

Update suborder to shipped status:

```bash
POST /shipping/suborder/ship
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "subOrderId": "{{subOrderId}}",
  "trackingNumber": "{{trackingNumber}}",
  "carrier": "{{carrier}}"
}
```

## Error Testing

### Invalid Address Testing

Test error handling with invalid shipping address:

```bash
POST /shipping/shipments/
Content-Type: application/json

{
  "cartItems": [...],
  "customerAddress": {
    "street1": "Invalid Address",
    "city": "",
    "state": "",
    "zipCode": "00000",
    "country": ""
  }
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Missing required address fields: city, state, country",
  "shippingGroups": []
}
```

### Missing SubOrder ID

Test missing suborder ID validation:

```bash
POST /shipping/suborder/label
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "subOrderId": ""
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "SubOrder ID is required"
}
```

## Advanced Testing Scenarios

### Complete Order Flow Testing

Run the complete flow in sequence:
1. Login → Get Auth Token
2. Get Shipping Options → Store Rate ID
3. Create Payment Intent → Store Payment Intent ID
4. Webhook Success → Order Created
5. Get Order → Verify Order Details
6. Update SubOrder Status → Processing
7. Create Shipping Label → Generate Label
8. Mark as Shipped → Complete Fulfillment

### Multi-Seller Testing

Test with multiple sellers:
- Use cart items from different sellers
- Verify separate shipping groups
- Confirm individual suborders created
- Test label generation for each suborder

### Fallback Shipping Testing

Test shipping fallbacks:
- Invalid seller addresses
- Shippo API failures
- Missing shipping rates
- Verify fallback rates are provided

## Monitoring & Tracking

### Track Shipments

Track shipping status:

```bash
POST /shipping/shipments/tracks/
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "trackingNumber": "{{trackingNumber}}",
  "carrier": "{{carrier}}"
}
```

### List All Shipments

Get shipment history:

```bash
GET /shipping/shipments?page=1&results=10
Authorization: Bearer {{authToken}}
```

## Troubleshooting

### Common Issues

1. **Authentication Failures:**
   - Verify user exists and password is correct
   - Check token expiration
   - Ensure proper Bearer token format

2. **Shipping Calculation Failures:**
   - Verify seller addresses are complete
   - Check Shippo API credentials
   - Validate product dimensions and weights

3. **Payment Intent Failures:**
   - Verify order data completeness
   - Check selected shipping options format
   - Ensure user has proper permissions

4. **Label Creation Failures:**
   - Verify suborder has selectedRateId
   - Check Shippo API connectivity
   - Validate rate ID exists and is valid

### Debug Endpoints

Use the debug endpoint for order troubleshooting:

```bash
GET /orders/debug/payment/{{paymentIntentId}}
```

## Data Models Reference

### Order Model Fields
- `totalAmount`, `totalTax`, `totalShipping`
- `orderItems[]` with product details
- `paymentStatus`, `fulfillmentStatus`
- `subOrders[]` array of SubOrder IDs
- `shippingAddress`, `billingAddress`

### SubOrder Model Fields
- `selectedRateId` - Shippo rate ID
- `trackingInfo` - tracking number, label URL, carrier
- `shippingDetails` - comprehensive shipping data
- `fulfillmentStatus` - order status

### Required Environment Variables
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret
- `SHIPPO_API_TOKEN` - Shippo API token
- `MAPBOX_API_KEY` - Mapbox geocoding (optional)

This testing guide ensures comprehensive validation of the entire order and shipping workflow, from initial shipping calculation through final delivery tracking.
