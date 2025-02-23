const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'low',
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', //coudl also be User for customers.
      // required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', //coudl also be User for customers.
      // required: true,
    },
    // type: {
    //   type: String,
    //   enum: ['order', 'product', 'user', 'inventory', 'payment', 'account'],
    //   required: true,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
