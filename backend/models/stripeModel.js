const { Schema, model } = require('mongoose');

const stripeSchema = new Schema(
  {
    sellerId: {
      type: Schema.ObjectId,
      ref: 'User',
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    storeId: {
      type: Schema.ObjectId,
      ref: 'Store',
    },
    stripeAccountId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      //required: true,
    },
    stripeCustomerId: {
      type: String,
      require: true,
    },
    subscriptionId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = model('stripes', stripeSchema);
