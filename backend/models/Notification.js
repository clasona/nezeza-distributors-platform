const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['email', 'sms', 'push'], // Add other channels if needed
    },
    template: {
      type: String,
      required: true,
    },
    provider_id: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
    },
    trigger_type: {
      type: String,
    },
    resource_id: {
      type: String,
    },
    resource_type: {
      type: String,
    },
    receiver_id: {
      type: String,
    },
    original_notification_id: {
      type: String,
    },
    external_id: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
