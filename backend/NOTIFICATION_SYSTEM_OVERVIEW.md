# Notification System Overview

This document provides a brief overview of how notifications are sent within our e-commerce platform, detailing the current state and future considerations for customer and seller notifications.

## How Notifications are Sent

Currently, notifications are sent using a unified utility `sendEmailAndNotification.js` that handles both email delivery and in-app notification creation. This utility ensures that all customer and seller communications are synchronized between email and the platform UI.

### Key Components:
- **Email and Notification Utilization**: A single function call to `sendEmailAndNotification.js` sends an email and creates a notification in the database.
- **OrderController Integration**: For "Shipped" status updates, the utility replaces manual email and notification calls, ensuring emails and notification appear simultaneously.
- **Planned Integration**: Future updates will integrate this utility into other order statuses and payment confirmations for seamless communication.

## Current Notifications

### Customer Notifications
- **Order Confirmation**: Email and in-app notification upon order placement.
- **Payment Confirmation**: Currently email only; in-app notification integration planned.
- **Order Shipped**: Unified email and notification sent.
- **Order Delivered**: Email only, pending update to include in-app notification.
- **Order Cancelled**: Email only, pending update to include in-app notification.

### Seller Notifications
- **New Order Alert**: Email sent; ability to see new orders through the platform dashboard.
- **Payment Received**: Planned email and notification integration for confirmed payments.

## Future Notification Enhancements

- **Full Order Flow Synchronization**: Integrate `sendEmailAndNotification.js` into all relevant actions within `orderController.js` for uniform customer experience.
- **Seller-facing Notifications**: Extend notification utility to cover seller alerts for order status and payments.

## Conclusion

The transition to a unified notification system aims to enhance the user experience by keeping communications consistent across emails and the platform. This document outlines what's currently implemented and what's planned, forming a roadmap for achieving comprehensive email and notification synchronization.
